/*
  Warnings:

  - You are about to drop the column `serviceId` on the `AddonService` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `UserSubscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `UserSubscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `operatorId` to the `AddonService` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AddonService" DROP CONSTRAINT "AddonService_serviceId_fkey";

-- DropIndex
DROP INDEX "AddonService_serviceId_idx";

-- AlterTable
ALTER TABLE "AddonService" DROP COLUMN "serviceId",
ADD COLUMN     "operatorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "userID" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "AddonService_operatorId_idx" ON "AddonService"("operatorId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSubscription_userId_key" ON "UserSubscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSubscription_stripeSubscriptionId_key" ON "UserSubscription"("stripeSubscriptionId");

-- AddForeignKey
ALTER TABLE "AddonService" ADD CONSTRAINT "AddonService_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "OperatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
