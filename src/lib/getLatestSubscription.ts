import { db } from "@/lib/prisma";

export async function getLatestUserSubscription(userId?: string, stripeSubscriptionId?: string) {
  if (!userId && !stripeSubscriptionId) {
    throw new Error("Must provide either userId or stripeSubscriptionId");
  }

  if (stripeSubscriptionId) {
    const byStripe = await db.subscription.findFirst({
      where: { stripeSubscriptionId },
      orderBy: { startDate: "desc" },
      include: { plan: true },
    });
    if (byStripe) return byStripe;
  }

  return await db.subscription.findFirst({
    where: { userId },
    orderBy: { startDate: "desc" },
    include: { plan: true },
  });
}