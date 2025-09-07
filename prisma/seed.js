import { db } from "../src/lib/prisma";
import { PlanType } from "../src/generated/prisma";

async function main() {
  const plans = [
    {
      type: PlanType.FREE,
      dailyLimit: 1000,
      monthlyLimit: 300,
      price: 0,
      stripePriceId: null,
    },
    {
      type: PlanType.STANDARD,
      dailyLimit: 5000,
      monthlyLimit: 15000,
      price: 50,
      stripePriceId: "price_1S2b6NRuuRix8vquD9SqCTvM",
    },
    {
      type: PlanType.PREMIUM,
      dailyLimit: 100000,
      monthlyLimit: 30000,
      price: 120,
      stripePriceId: "price_1S2b6zRuuRix8vquhRTIhKw7",
    },
  ];

  for (const plan of plans) {
    await db.planConfig.upsert({
      where: { type: plan.type },
      update: plan,
      create: plan,
    });
  }

  console.log("✅ Plans seeded!");
}

main()
  .catch((err) => {
    console.error("❌ Error seeding plans:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
