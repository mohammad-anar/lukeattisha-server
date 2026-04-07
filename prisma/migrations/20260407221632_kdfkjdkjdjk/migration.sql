/*
  Warnings:

  - You are about to drop the column `deliveryFee` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `pickupFee` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AdminSetting" ADD COLUMN     "pickupAndDeliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 4.99;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "deliveryFee",
DROP COLUMN "pickupFee",
ADD COLUMN     "fixedTransactionFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "pickupAndDeliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 4.99;
