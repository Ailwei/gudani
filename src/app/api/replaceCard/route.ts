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
    let { paymentMethodId, card, replace } = body;

    const dbUser = await db.user.findUnique({ where: { id: user.userId } });
    if (!dbUser) {
  return NextResponse.json({ error: "User not found in database" }, { status: 404 });
}

if (!dbUser.stripeCustomerId) {
  const customer = await stripe.customers.create({
    email: dbUser.email ?? undefined,
    name: `${dbUser.firstName} ${dbUser.lastName}`.trim() || undefined,
  });

  await db.user.update({
    where: { id: user.userId },
    data: { stripeCustomerId: customer.id },
  });

  dbUser.stripeCustomerId = customer.id;
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

    if(replace){
      const paymentMethods = await stripe.paymentMethods.list({
      customer: dbUser.stripeCustomerId,
      type: "card",
    });

     const otherCards = paymentMethods.data.filter(pm => pm.id !== paymentMethodId);
      if (otherCards.length > 0) {
        for (const pm of otherCards) {
          await stripe.paymentMethods.detach(pm.id);
        }
      }
    }
    return NextResponse.json({
      success: true,
      message: replace ? "Card replaced successfully" : "Card added successfully",
      paymentMethodId,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
