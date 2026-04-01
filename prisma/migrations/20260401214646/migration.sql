/*
  Warnings:

  - You are about to drop the column `name` on the `AddonService` table. All the data in the column will be lost.
  - You are about to drop the column `operatorId` on the `AddonService` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `AddonService` table. All the data in the column will be lost.
  - The `bannerType` column on the `Banner` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `isActive` column on the `Banner` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[serviceId,addonId]` on the table `AddonService` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `addonId` to the `AddonService` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceId` to the `AddonService` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BannerType" AS ENUM ('PROMOTION', 'MEMBERSHIP', 'SEASONAL', 'OFFER');

-- CreateEnum
CREATE TYPE "BannerStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- DropForeignKey
ALTER TABLE "AddonService" DROP CONSTRAINT "AddonService_operatorId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItemAddon" DROP CONSTRAINT "OrderItemAddon_addonId_fkey";

-- DropIndex
DROP INDEX "AddonService_operatorId_idx";

-- AlterTable
ALTER TABLE "AddonService" DROP COLUMN "name",
DROP COLUMN "operatorId",
DROP COLUMN "price",
ADD COLUMN     "addonId" TEXT NOT NULL,
ADD COLUMN     "serviceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Banner" DROP COLUMN "bannerType",
ADD COLUMN     "bannerType" "BannerType",
DROP COLUMN "isActive",
ADD COLUMN     "isActive" "BannerStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItemAddon" (
    "id" TEXT NOT NULL,
    "cartItemId" TEXT NOT NULL,
    "addonId" TEXT NOT NULL,

    CONSTRAINT "CartItemAddon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Addon" (
    "id" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Addon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_key" ON "Cart"("userId");

-- CreateIndex
CREATE INDEX "Cart_userId_idx" ON "Cart"("userId");

-- CreateIndex
CREATE INDEX "CartItem_cartId_idx" ON "CartItem"("cartId");

-- CreateIndex
CREATE INDEX "CartItem_serviceId_idx" ON "CartItem"("serviceId");

-- CreateIndex
CREATE INDEX "CartItemAddon_cartItemId_idx" ON "CartItemAddon"("cartItemId");

-- CreateIndex
CREATE INDEX "CartItemAddon_addonId_idx" ON "CartItemAddon"("addonId");

-- CreateIndex
CREATE INDEX "Addon_operatorId_idx" ON "Addon"("operatorId");

-- CreateIndex
CREATE INDEX "AddonService_serviceId_idx" ON "AddonService"("serviceId");

-- CreateIndex
CREATE INDEX "AddonService_addonId_idx" ON "AddonService"("addonId");

-- CreateIndex
CREATE UNIQUE INDEX "AddonService_serviceId_addonId_key" ON "AddonService"("serviceId", "addonId");

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItemAddon" ADD CONSTRAINT "CartItemAddon_cartItemId_fkey" FOREIGN KEY ("cartItemId") REFERENCES "CartItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItemAddon" ADD CONSTRAINT "CartItemAddon_addonId_fkey" FOREIGN KEY ("addonId") REFERENCES "Addon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemAddon" ADD CONSTRAINT "OrderItemAddon_addonId_fkey" FOREIGN KEY ("addonId") REFERENCES "Addon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddonService" ADD CONSTRAINT "AddonService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddonService" ADD CONSTRAINT "AddonService_addonId_fkey" FOREIGN KEY ("addonId") REFERENCES "Addon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Addon" ADD CONSTRAINT "Addon_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "OperatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
