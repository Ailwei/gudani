import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { db } from "@/lib/prisma";
import { verifyToken } from "@/utils/veriffyToken";
import { sendSubscriptionCancelled } from "@/lib/cancelSubNotification";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const user = await verifyToken(token);
    if (!user?.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const subscription = await db.subscription.findFirst({
      where: { userId: user.userId, status: "ACTIVE" },
      include: { plan: true, user: true },
    });

    if (!subscription) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    if (!subscription.paystackSubscriptionId || !subscription.emailToken) {
      return NextResponse.json({ error: "Missing Paystack subscription data" }, { status: 400 });
    }
    const paystackRes = await axios.post(
      "https://api.paystack.co/subscription/disable",
      {
        code: subscription.paystackSubscriptionId,
        token: subscription.emailToken,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Paystack disable response:", paystackRes.data);

    if (!paystackRes.data.status) {
      return NextResponse.json(
        { error: paystackRes.data.message || "Failed to cancel on Paystack" },
        { status: 400 }
      );
    }

    const updatedSub = await db.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
        cancellationDate: subscription.endDate,
      },
      include: { user: true, plan: true },
    });

    try {
      await sendSubscriptionCancelled(updatedSub.user, updatedSub.plan, updatedSub);
    } catch (err) {
    }

    return NextResponse.json({
      success: true,
      message: `Subscription set to Non-Renewing and scheduled to end on ${new Date(
        subscription.endDate!
      ).toLocaleDateString()}`,
      subscriptionCode: subscription.paystackSubscriptionId,
      authorizationToken: subscription.emailToken,
      plan: subscription.plan.type,
      cancelAtPeriodEnd: true,
      cancellationDate: subscription.endDate,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.response?.data?.message || err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
