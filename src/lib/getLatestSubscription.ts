import { db } from "@/lib/prisma";

export async function getLatestUserSubscription(userId?: string, stripeSubscriptionId?: string) {
  if (!userId && !stripeSubscriptionId) {
    throw new Error("Must provide either userId or stripeSubscriptionId");
  }

  return await db.subscription.findFirst({
    where: {
      ...(userId ? { userId } : {}),
      ...(stripeSubscriptionId ? { stripeSubscriptionId } : {}),
    },
    orderBy: { startDate: "desc" },
    include: { plan: true },
  });
}