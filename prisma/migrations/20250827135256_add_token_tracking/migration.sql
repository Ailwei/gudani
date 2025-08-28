-- CreateEnum
CREATE TYPE "public"."PlanType" AS ENUM ('FREE', 'STANDARD', 'PREMIUM');

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "lastReset" TIMESTAMP(3),
ADD COLUMN     "planType" "public"."PlanType" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "tokensUsed" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."TokenUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokens" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlanConfig" (
    "id" TEXT NOT NULL,
    "type" "public"."PlanType" NOT NULL,
    "dailyLimit" INTEGER,
    "monthlyLimit" INTEGER,
    "price" INTEGER,

    CONSTRAINT "PlanConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanConfig_type_key" ON "public"."PlanConfig"("type");

-- AddForeignKey
ALTER TABLE "public"."user" ADD CONSTRAINT "user_planType_fkey" FOREIGN KEY ("planType") REFERENCES "public"."PlanConfig"("type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TokenUsage" ADD CONSTRAINT "TokenUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
