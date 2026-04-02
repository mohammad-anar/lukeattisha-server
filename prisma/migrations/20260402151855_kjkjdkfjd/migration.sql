/*
  Warnings:

  - You are about to drop the column `userID` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reviewId]` on the table `ServiceReview` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ticketId]` on the table `SupportTicket` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_userID_key";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "orderId" TEXT;

-- AlterTable
ALTER TABLE "ServiceReview" ADD COLUMN     "reviewId" TEXT;

-- AlterTable
ALTER TABLE "SupportTicket" ADD COLUMN     "ticketId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "userID",
ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceReview_reviewId_key" ON "ServiceReview"("reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "SupportTicket_ticketId_key" ON "SupportTicket"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "User_userId_key" ON "User"("userId");
