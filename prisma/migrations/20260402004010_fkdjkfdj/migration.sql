/*
  Warnings:

  - You are about to drop the column `operatorId` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_operatorId_fkey";

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "serviceBundleId" TEXT,
ALTER COLUMN "serviceId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "operatorId",
ADD COLUMN     "operatorIds" TEXT[];

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "serviceBundleId" TEXT,
ALTER COLUMN "serviceId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "CartItem_serviceBundleId_idx" ON "CartItem"("serviceBundleId");

-- CreateIndex
CREATE INDEX "OrderItem_serviceBundleId_idx" ON "OrderItem"("serviceBundleId");

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_serviceBundleId_fkey" FOREIGN KEY ("serviceBundleId") REFERENCES "ServiceBundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_serviceBundleId_fkey" FOREIGN KEY ("serviceBundleId") REFERENCES "ServiceBundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
