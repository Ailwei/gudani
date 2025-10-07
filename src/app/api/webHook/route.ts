import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/prisma";
import { SubscriptionStatus, PaymentStatus } from "@/generated/prisma";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");
    const secret = process.env.PAYSTACK_SECRET_KEY!;

    const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
    if (hash !== signature) {
      console.warn("Invalid Paystack signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const { event, data } = JSON.parse(rawBody);

    if (event === "subscription.not_renewing" || event === "subscription.disabled") {
      const subscriptionCode = data.subscription_code;

      const subscription = await db.subscription.findFirst({
        where: { paystackSubscriptionId: subscriptionCode },
      });

      if (!subscription) {
        return NextResponse.json({ received: true });
      }

      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: SubscriptionStatus.ACTIVE,
          paymentStatus: PaymentStatus.PENDING,
        },
      });

      const freePlan = await db.planConfig.findFirst({
        where: { type: "FREE" },
      });

      if (freePlan) {
        await db.subscription.create({
          data: {
            userId: subscription.userId,
            planId: freePlan.id,
            status: SubscriptionStatus.ACTIVE,
            paymentStatus: PaymentStatus.FREE,
            startDate: new Date(),
          },
        });

      } else {
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
