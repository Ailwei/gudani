import { db } from "../src/lib/prisma";
import { PlanType } from "../src/generated/prisma";

async function main() {
  const plans = [
    {
      type: PlanType.FREE,
      dailyLimit: 10,
      monthlyLimit: 300,
      price: 0,
      stripePriceId: null,
    },
    {
      type: PlanType.STANDARD,
      dailyLimit: 500,
      monthlyLimit: 15000,
      price: 110,
      stripePriceId: "price_12345_standard_test",
    },
    {
      type: PlanType.PREMIUM,
      dailyLimit: 1000,
      monthlyLimit: 30000,
      price: 250,
      stripePriceId: "price_67890_premium_test",
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
