/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `OrderIssue` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "IssueStatus" ADD VALUE 'ESCALATED';
ALTER TYPE "IssueStatus" ADD VALUE 'REFUNDED';

-- AlterTable
ALTER TABLE "EmailSupport" ADD COLUMN     "orderId" TEXT;

-- AlterTable
ALTER TABLE "LiveSupportMessage" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "OrderIssue" DROP COLUMN "imageUrl",
ADD COLUMN     "adminNote" TEXT,
ADD COLUMN     "escalationNote" TEXT,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "isEscalated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "issueTitle" TEXT,
ADD COLUMN     "operatorId" TEXT,
ADD COLUMN     "operatorNote" TEXT,
ADD COLUMN     "refundAmount" DECIMAL(10,2);

-- AddForeignKey
ALTER TABLE "OrderIssue" ADD CONSTRAINT "OrderIssue_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
