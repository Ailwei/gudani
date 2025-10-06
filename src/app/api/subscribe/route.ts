import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { db } from "@/lib/prisma";
import { PlanType, PaymentStatus, SubscriptionStatus } from "@/generated/prisma";
import { getLatestUserSubscription } from "@/lib/getLatestSubscription";

export async function POST(req: NextRequest) {
  try {
    const { userId, planType } = await req.json();
    if (!userId || !planType) {
      return NextResponse.json({ error: "Missing userId or planType" }, { status: 400 });
    }

    const normalizedPlanType = planType.toUpperCase();

    const plan = await db.planConfig.findFirst({ where: { type: normalizedPlanType as PlanType } });
    if (!plan || !plan.paystackPlanCode || !plan.price) {
      return NextResponse.json({ error: "Invalid plan or missing Paystack plan code/price" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || !user.email) {
      return NextResponse.json({ error: "User not found or missing email" }, { status: 404 });
    }

    let customerCode = user.paystackCustomerId;

    if (!customerCode) {
      const res = await axios.post(
        "https://api.paystack.co/customer",
        { email: user.email, first_name: user.firstName, last_name: user.lastName },
        { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
      );
      customerCode = res.data.data.customer_code;

      await db.user.update({ where: { id: userId }, data: { paystackCustomerId: customerCode } });
    }

    const authRes = await axios.get(`https://api.paystack.co/customer/${customerCode}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    const authorizations = authRes.data.data.authorizations || [];
    const primaryAuth = authorizations.length > 0 ? authorizations[0] : null;

    if (!primaryAuth) {
      const amountInKobo = plan.price * 100;
      const initRes = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          email: user.email,
          amount: amountInKobo,
          metadata: { userId, planType: normalizedPlanType, planId: plan.id },
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/verify?planId=${plan.id}`,
        },
        { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
      );

      return NextResponse.json({
        requiresPayment: true,
        url: initRes.data.data.authorization_url,
        reference: initRes.data.data.reference,
      });
    }

    const subRes = await axios.post(
      "https://api.paystack.co/subscription",
      { customer: customerCode, plan: plan.paystackPlanCode, authorization: primaryAuth.authorization_code },
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
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
          endDate: subData.next_payment_date ? new Date(subData.next_payment_date) : null,
        },
      });
    } else {
      await db.subscription.create({
        data: {
          userId,
          planId: plan.id,
          paystackSubscriptionId: subData.subscription_code,
          emailToken : subData.email_token,
          status: SubscriptionStatus.ACTIVE,
          paymentStatus: PaymentStatus.PAID,
          startDate: new Date(),
          endDate: subData.next_payment_date ? new Date(subData.next_payment_date) : null,
        },
      });
    }

    return NextResponse.json({
     requiresPayment: false,
      subscriptionCode: subData.subscription_code,
      emailToken: subData.email_token,
      customerCode: customerCode,
      authorizations,
      subscriptionData: subData,
    });
  } catch (err: any) {
    console.error("Subscribe error:", err.response?.data || err.message);
    return NextResponse.json({ error: err.response?.data?.message || err.message || "Internal server error" }, { status: 500 });
  }
}
