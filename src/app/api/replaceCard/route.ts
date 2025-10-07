import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/prisma";
import { verifyToken } from "@/utils/veriffyToken";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    let { paymentMethodId, card } = body;

    let dbUser = await db.user.findUnique({ where: { id: user.userId } });

    let customerId = dbUser?.paystackCustomerId ?? null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: dbUser?.email ?? undefined,
        metadata: { userId: user.userId },
      });

      customerId = customer.id;

      await db.user.update({
        where: { id: user.userId },
        data: { paystackCustomerId: customerId },
      });
      dbUser = await db.user.findUnique({ where: { id: user.userId } });
    }

    if (!paymentMethodId && card) {
      const newPm = await stripe.paymentMethods.create({
        type: "card",
        card: {
          number: card.number,
          exp_month: card.exp_month,
          exp_year: card.exp_year,
          cvc: card.cvc,
        },
      });
      paymentMethodId = newPm.id;
    }

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: "Please provide card details or paymentMethodId" },
        { status: 400 }
      );
    }

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    for (const pm of paymentMethods.data) {
      if (pm.id !== paymentMethodId) {
        await stripe.paymentMethods.detach(pm.id);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Card replaced successfully",
      paymentMethodId,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
