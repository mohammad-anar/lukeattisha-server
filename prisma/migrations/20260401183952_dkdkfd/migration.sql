/*
  Warnings:

  - A unique constraint covering the columns `[userID]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "SubscriptionPackage" ADD COLUMN     "stripePriceId" TEXT,
ADD COLUMN     "stripeProductId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userID" TEXT;

-- AlterTable
ALTER TABLE "UserSubscription" ADD COLUMN     "stripeSubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_userID_key" ON "User"("userID");
