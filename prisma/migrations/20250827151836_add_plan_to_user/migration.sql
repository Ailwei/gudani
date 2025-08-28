/*
  Warnings:

  - You are about to drop the column `planType` on the `user` table. All the data in the column will be lost.
  - Added the required column `planId` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."user" DROP CONSTRAINT "user_planType_fkey";

-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "planType",
ADD COLUMN     "planId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."user" ADD CONSTRAINT "user_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."PlanConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
