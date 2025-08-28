import { db } from "../src/lib/prisma";

async function main() {
  const plans = [
    { type: "FREE", dailyLimit: 10, monthlyLimit: 300, price: 0 },
    { type: "STANDARD", dailyLimit: 500, monthlyLimit: 15000, price: 110 },
    { type: "PREMIUM", dailyLimit: 1000, monthlyLimit: 30000, price: 250 },
  ];

  for (const plan of plans) {
    await db.planConfig.upsert({
      where: { type: plan.type },
      update: plan,
      create: plan,
    });
  }

  console.log("Plans seeded!");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
