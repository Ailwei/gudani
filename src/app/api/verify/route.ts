import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { db } from "@/lib/prisma";
import { PaymentStatus, SubscriptionStatus } from "@/generated/prisma";
import { getLatestUserSubscription } from "@/lib/getLatestSubscription";

export async function GET(req: NextRequest) {
  const reference =
    req.nextUrl.searchParams.get("reference") ||
    req.nextUrl.searchParams.get("trxref");

  if (!reference) {
    return NextResponse.json(
      { status: false, message: "No reference provided" },
      { status: 400 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  try {
    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = verifyRes.data.data;
    if (!data || data.status !== "success") {
      return NextResponse.redirect(`${baseUrl}/verify-failed`);
    }

    const userId = data.metadata?.userId;
    const planId = data.metadata?.planId;
    const planType = data.metadata?.planType;

    if (!userId || !planId || !planType) {
      console.error("Missing metadata in Paystack transaction:", data.metadata);
      return NextResponse.redirect(`${baseUrl}/verify-failed`);
    }

    const customerCode = data.customer.customer_code;
    const authorizationCode = data.authorization.authorization_code;

    await db.user.update({
      where: { id: userId },
      data: { paystackCustomerId: customerCode },
    });

    const plan = await db.planConfig.findUnique({ where: { id: planId } });
    if (!plan || !plan.paystackPlanCode) {
      return NextResponse.redirect(`${baseUrl}/verify-failed`);
    }

    const subRes = await axios.post(
      "https://api.paystack.co/subscription",
      {
        customer: customerCode,
        plan: plan.paystackPlanCode,
        authorization: authorizationCode,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const subData = subRes.data.data;
    const existingSub = await getLatestUserSubscription(userId);

   if (existingSub) {
      await db.subscription.update({
        where: { id: existingSub.id },
        data: {
          planId: plan.id,
          paystackSubscriptionId: subData.subscription_code,
          emailToken: subData.email_token,
          status: SubscriptionStatus.ACTIVE,
          paymentStatus: PaymentStatus.PAID,
          startDate: new Date(),
          endDate: subData.next_payment_date
            ? new Date(subData.next_payment_date)
            : null,
        },
      });
    } else {
      await db.subscription.create({
        data: {
          userId,
          planId: plan.id,
          paystackSubscriptionId: subData.subscription_code,
          emailToken: subData.email_token,
          status: SubscriptionStatus.ACTIVE,
          paymentStatus: PaymentStatus.PAID,
          startDate: new Date(),
          endDate: subData.next_payment_date
            ? new Date(subData.next_payment_date)
            : null,
        },
      });
    }
    return NextResponse.redirect(`${baseUrl}/verify-success`);
  } catch (err: any) {
    console.error("Paystack verification error:", err.response?.data || err);
    return NextResponse.redirect(`${baseUrl}/verify-failed`);
  }
}
