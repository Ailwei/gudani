import { NextRequest, NextResponse } from "next/server";
import { getLatestUserSubscription } from "@/lib/getLatestSubscription";
import { verifyToken } from "@/utils/veriffyToken";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const user = await verifyToken(token);

    if (!user || !user.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const subscription = await getLatestUserSubscription(user.userId);

    if (!subscription) {
      return NextResponse.json({ message: "No active subscription found" }, { status: 404 });
    }

    const plan = subscription.plan;

   return NextResponse.json({
  planType: subscription.plan.type,
  status: subscription.status,
  paymentStatus: subscription.paymentStatus ?? "UNPAID",
  pastDueAmount: subscription.pastDueAmount ?? 0,
  pastDueCurrency: subscription.pastDueCurrency ?? null,
  startDate: subscription.startDate,
  endDate: subscription.endDate,
  paystackSubscriptionId: subscription.paystackSubscriptionId,
  cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  cancellationDate: subscription.cancellationDate,
});

  } catch (err: any) {
    console.error("Subscription fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}