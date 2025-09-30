import { NextRequest, NextResponse } from "next/server";
import { getLatestUserSubscription } from "@/lib/getLatestSubscription";
import { stripe } from "@/lib/stripe";
import { verifyToken } from "@/utils/veriffyToken";
import { db } from "@/lib/prisma";
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

    const existingSub = await getLatestUserSubscription(user.userId);
    if (!existingSub) {
      return NextResponse.json({ error: "No subscription found" }, { status: 400 });
    }

    if (existingSub.stripeSubscriptionId) {
  const cancelledSub = await stripe.subscriptions.update(
    existingSub.stripeSubscriptionId,
    { cancel_at_period_end: true }
  );


   const updatedSub=   await db.subscription.update({
        where: { id: existingSub.id },
        data: {
          cancelAtPeriodEnd: true,
          cancellationDate: new Date(existingSub.endDate || ''),
        },
        include: {
          user: true,
          plan: true,

        }
      });

       try {
        await sendSubscriptionCancelled(updatedSub.user, updatedSub.plan, updatedSub);
        console.log("Cancellation email sent to", updatedSub.user.email);
      } catch (err) {
        console.error("Failed to send cancellation email:", err);
      }

      return NextResponse.json({ success: true, message: "Subscription cancellation scheduled" });
    } else {
      const freePlan = await db.planConfig.findUnique({ where: { type: "FREE" } });
      if (!freePlan) {
        throw new Error("Default free plan not found in DB");
      }

      await db.subscription.update({
        where: { id: existingSub.id },
        data: {
          planId: freePlan.id,
          status: "ACTIVE",
          startDate: new Date(),
          endDate: null,
          cancelAtPeriodEnd: false,
          cancellationDate: null,
        },
      });

      return NextResponse.json({ success: true, message: "Free plan reset successfully" });
    }
  } catch (err: any) {
    console.error("Cancel subscription error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
