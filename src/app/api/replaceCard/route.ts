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

    const dbUser = await db.user.findUnique({ where: { id: user.userId } });
    if (!dbUser?.stripeCustomerId) {
      return NextResponse.json({ error: "No Stripe customer found" }, { status: 404 });
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
      return NextResponse.json({ error: "Please provide card details or paymentMethodId" }, { status: 400 });
    }

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: dbUser.stripeCustomerId,
    });

    await stripe.customers.update(dbUser.stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    const paymentMethods = await stripe.paymentMethods.list({
      customer: dbUser.stripeCustomerId,
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
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
