/*
  Warnings:

  - You are about to drop the column `stripeSubscriptionId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paystackSubscriptionId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paystackCustomerId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Subscription_stripeSubscriptionId_key";

-- DropIndex
DROP INDEX "public"."user_stripeCustomerId_key";

-- AlterTable
ALTER TABLE "public"."Subscription" DROP COLUMN "stripeSubscriptionId",
ADD COLUMN     "paystackSubscriptionId" TEXT;

-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "stripeCustomerId",
ADD COLUMN     "paystackCustomerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_paystackSubscriptionId_key" ON "public"."Subscription"("paystackSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_paystackCustomerId_key" ON "public"."user"("paystackCustomerId");
