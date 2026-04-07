/*
  Warnings:

  - You are about to drop the column `deliveryAddress` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `pickupAddress` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "deliveryAddress",
DROP COLUMN "pickupAddress";

-- CreateTable
CREATE TABLE "OrderPickupAddress" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "pickupTime" TEXT,
    "pickupDate" TEXT,
    "streetAddress" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL,
    "postalCode" TEXT,

    CONSTRAINT "OrderPickupAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderDeliveryAddress" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "deliveryTime" TEXT,
    "streetAddress" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL,
    "postalCode" TEXT,

    CONSTRAINT "OrderDeliveryAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderPickupAddress_orderId_key" ON "OrderPickupAddress"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderDeliveryAddress_orderId_key" ON "OrderDeliveryAddress"("orderId");

-- AddForeignKey
ALTER TABLE "OrderPickupAddress" ADD CONSTRAINT "OrderPickupAddress_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDeliveryAddress" ADD CONSTRAINT "OrderDeliveryAddress_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
