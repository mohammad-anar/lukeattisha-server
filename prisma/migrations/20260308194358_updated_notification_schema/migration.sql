/*
  Warnings:

  - You are about to drop the column `roomId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `workshopId` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `eventType` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_jobId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_workshopId_fkey";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "roomId",
DROP COLUMN "workshopId",
ADD COLUMN     "eventType" TEXT NOT NULL,
ADD COLUMN     "invoiceId" TEXT,
ADD COLUMN     "userIds" TEXT[],
ALTER COLUMN "jobId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ChatNotification" (
    "id" TEXT NOT NULL,
    "userIds" TEXT[],
    "chatRoomId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "triggeredById" TEXT,
    "title" TEXT,
    "body" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatNotification_pkey" PRIMARY KEY ("id")
);
