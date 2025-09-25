import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/prisma";
import { PlanType } from "@/generated/prisma";
import { getLatestUserSubscription } from "@/lib/getLatestSubscription";
export async function POST(req: NextRequest) {
  try {
    const { userId, planType } = await req.json();

    if (!planType || typeof planType !== "string") {
      return NextResponse.json({ error: "Missing or invalid planType" }, { status: 400 });
    }

    const normalizedPlanType = planType.toUpperCase();
    const targetPlan = await db.planConfig.findFirst({
      where: { type: normalizedPlanType as PlanType },
    });

    if (!targetPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentSub = await getLatestUserSubscription(userId);
    const currentPlanType = currentSub?.plan?.type;

    if (currentPlanType === normalizedPlanType) {
      return NextResponse.json({ error: "You're already on this plan" }, { status: 400 });
    }

    if (normalizedPlanType === "FREE") {
      if (!currentSub) {
        return NextResponse.json({ error: "No active subscription to downgrade." }, { status: 400 });
      }

      if (currentSub.stripeSubscriptionId) {
        await stripe.subscriptions.cancel(currentSub.stripeSubscriptionId);
      }
      const updated = await db.subscription.update({
        where: { id: currentSub.id },
        data: {
          planId: targetPlan.id,
          stripeSubscriptionId: null,
          status: "ACTIVE",
          startDate: new Date(),
          endDate: null,
           cancelAtPeriodEnd: false,
           cancellationDate: null,
        },
      });
      return NextResponse.json({ message: "Downgraded to Free", subscription: updated });
    }
    if (currentSub?.stripeSubscriptionId) {
      const stripeSub = await stripe.subscriptions.retrieve(currentSub.stripeSubscriptionId);
      const itemId = stripeSub.items.data[0].id;

      await stripe.subscriptions.update(currentSub.stripeSubscriptionId, {
        items: [{ id: itemId, price: targetPlan.stripePriceId ?? undefined }],
        metadata: {
          userId,
          planType: normalizedPlanType,
          planId: targetPlan.id,
        },
      });
      const updated = await db.subscription.update({
        where: { id: currentSub.id },
        data: {
          planId: targetPlan.id,
          status: "ACTIVE",
          startDate: new Date(),
        },
      });
      return NextResponse.json({ message: "Plan updated", subscription: updated });
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
        metadata: { userId },
      });
      customerId = customer.id;

      await db.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    if (!targetPlan.stripePriceId) {
      return NextResponse.json({ error: "Plan is missing Stripe price ID" }, { status: 400 });
    }

    const customer = await stripe.customers.retrieve(customerId, {
      expand: ["invoice_settings.default_payment_method"],
    });
    const defaultPm = (customer as any).invoice_settings?.default_payment_method;

    if (defaultPm) {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: targetPlan.stripePriceId }],
        default_payment_method: defaultPm.id,
        metadata: {
          userId,
          planId: targetPlan.id,
          planType: normalizedPlanType,
        },
      });

      const saved = await db.subscription.create({
        data: {
          userId,
          planId: targetPlan.id,
          stripeSubscriptionId: subscription.id,
          status: "ACTIVE",
          startDate: new Date(),
          cancelAtPeriodEnd: false,
        },
      });

      return NextResponse.json({
        message: "Subscribed with saved card",
        subscription: saved,
      });
    }
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [{ price: targetPlan.stripePriceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      metadata: {
        userId,
        planId: targetPlan.id,
        planType: normalizedPlanType,
      },
      subscription_data: {
        metadata: {
          userId,
          planId: targetPlan.id,
          planType: normalizedPlanType,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Subscribe route error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}