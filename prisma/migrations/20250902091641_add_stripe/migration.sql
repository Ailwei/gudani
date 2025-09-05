/*
  Warnings:

  - You are about to drop the column `planId` on the `user` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."user" DROP CONSTRAINT "user_planId_fkey";

-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "planId";
