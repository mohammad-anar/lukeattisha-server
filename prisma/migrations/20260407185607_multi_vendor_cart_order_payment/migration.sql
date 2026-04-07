/*
  Warnings:

  - You are about to drop the column `transactionType` on the `AdminWalletTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `Cart` table. All the data in the column will be lost.
  - You are about to drop the column `onboardingComplete` on the `Operator` table. All the data in the column will be lost.
  - You are about to drop the column `onboardingUrl` on the `Operator` table. All the data in the column will be lost.
  - You are about to drop the column `stripeConnectedAccountId` on the `Operator` table. All the data in the column will be lost.
  - You are about to drop the column `transactionType` on the `OperatorWalletTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `operatorAmount` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSessionId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `operatorAmount` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `payoutStatus` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `platformFee` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSessionId` on the `Payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeAccountId]` on the table `Operator` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orderId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripePaymentIntentId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `AdminWalletTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `operatorId` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `OperatorWalletTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryAddress` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickupAddress` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduledDate` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `operatorOrderId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripeTransferGroup` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Made the column `stripePaymentIntentId` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "StripeAccountStatus" AS ENUM ('PENDING', 'ONBOARDING', 'ACTIVE', 'RESTRICTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionType" ADD VALUE 'CREDIT';
ALTER TYPE "TransactionType" ADD VALUE 'DEBIT';

-- DropForeignKey
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_storeId_fkey";

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_cartId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_storeId_fkey";

-- DropForeignKey
ALTER TABLE "SelectedAddon" DROP CONSTRAINT "SelectedAddon_cartItemId_fkey";

-- DropIndex
DROP INDEX "Operator_stripeConnectedAccountId_key";

-- AlterTable
ALTER TABLE "AdminWalletTransaction" DROP COLUMN "transactionType",
ADD COLUMN     "type" "TransactionType" NOT NULL;

-- AlterTable
ALTER TABLE "Cart" DROP COLUMN "storeId";

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "operatorId" TEXT NOT NULL,
ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Operator" DROP COLUMN "onboardingComplete",
DROP COLUMN "onboardingUrl",
DROP COLUMN "stripeConnectedAccountId",
ADD COLUMN     "stripeAccountId" TEXT,
ADD COLUMN     "stripeAccountStatus" "StripeAccountStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "OperatorWalletTransaction" DROP COLUMN "transactionType",
ADD COLUMN     "operatorId" TEXT,
ADD COLUMN     "type" "TransactionType" NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "operatorAmount",
DROP COLUMN "storeId",
DROP COLUMN "stripeSessionId",
ADD COLUMN     "deliveryAddress" TEXT NOT NULL,
ADD COLUMN     "deliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "isSubscription" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentUrl" TEXT,
ADD COLUMN     "pickupAddress" TEXT NOT NULL,
ADD COLUMN     "pickupFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "scheduledDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "stripePaymentIntentId" TEXT,
ADD COLUMN     "stripeTransferGroup" TEXT,
ADD COLUMN     "subtotal" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "operatorOrderId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "operatorAmount",
DROP COLUMN "paymentMethod",
DROP COLUMN "payoutStatus",
DROP COLUMN "platformFee",
DROP COLUMN "stripeSessionId",
ADD COLUMN     "paymentUrl" TEXT,
ADD COLUMN     "stripeTransferGroup" TEXT NOT NULL,
ALTER COLUMN "stripePaymentIntentId" SET NOT NULL;

-- CreateTable
CREATE TABLE "OperatorOrder" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "transferAmount" DECIMAL(10,2) NOT NULL,
    "transferStatus" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "stripeTransferId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperatorOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transfer" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "stripeConnectedAccId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "stripeTransferId" TEXT,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_key" ON "Cart"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Operator_stripeAccountId_key" ON "Operator"("stripeAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON "Payment"("stripePaymentIntentId");

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectedAddon" ADD CONSTRAINT "SelectedAddon_cartItemId_fkey" FOREIGN KEY ("cartItemId") REFERENCES "CartItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorOrder" ADD CONSTRAINT "OperatorOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorOrder" ADD CONSTRAINT "OperatorOrder_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorOrder" ADD CONSTRAINT "OperatorOrder_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_operatorOrderId_fkey" FOREIGN KEY ("operatorOrderId") REFERENCES "OperatorOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorWalletTransaction" ADD CONSTRAINT "OperatorWalletTransaction_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
