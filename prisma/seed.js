import { db } from "../src/lib/prisma";
import { PlanType } from "../src/generated/prisma";

async function main() {
  const plans = [
    {
      type: PlanType.FREE,
      dailyLimit: 1000,
      monthlyLimit: 30000,
      price: 0,
      paystackPlanCode: null,
    },
    {
      type: PlanType.STANDARD,
      dailyLimit: 10000,
      monthlyLimit: 150000,
      price: 50,
      paystackPlanCode: "PLN_78if9xrucw07445"
    },
    {
      type: PlanType.PREMIUM,
      dailyLimit: 15000,
      monthlyLimit: 450000,
      price: 120,
      paystackPlanCode: "PLN_ki7fcog4lx0fexr"
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
