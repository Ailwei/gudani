import { db } from "@/lib/prisma";

export async function getLatestUserSubscription(userId: string) {
  if (!userId) throw new Error("User ID is required");

  const subscription = await db.subscription.findFirst({
    where: { userId },
    orderBy: { startDate: "desc" },
    include: {
      plan: true,
    },
  });

  return subscription;
}
