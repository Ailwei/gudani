import { db } from "@/lib/prisma";

export async function checkAndConsumeTokens(
  userId: string,
  tokens: number
): Promise<{ success: boolean; error?: string }> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return await db.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      include: {
        Subscription: {
          where: { status: "ACTIVE" },
          orderBy: { startDate: "desc" },
          include: { plan: true },
        },
      },
    });

    if (!user) return { success: false, error: "User not found" };

    const activeSub = user.Subscription[0];
    const plan = activeSub?.plan;

    const dailyUsage = await tx.tokenUsage.aggregate({
      _sum: { tokens: true },
      where: { userId, createdAt: { gte: startOfToday } },
    });
    const tokensUsedToday = dailyUsage._sum.tokens || 0;

    const monthlyUsage = await tx.tokenUsage.aggregate({
      _sum: { tokens: true },
      where: { userId, createdAt: { gte: startOfMonth } },
    });
    const tokensUsedThisMonth = monthlyUsage._sum.tokens || 0;

    if (plan?.dailyLimit && tokensUsedToday + tokens > plan.dailyLimit) {
      return { success: false, error: "Daily token limit exceeded" };
    }

    if (plan?.monthlyLimit && tokensUsedThisMonth + tokens > plan.monthlyLimit) {
      return { success: false, error: "Monthly token limit exceeded" };
    }

    await tx.tokenUsage.create({
      data: { userId, tokens },
    });

    return { success: true };
  });
}
