/*
  Warnings:

  - You are about to drop the column `bundleId` on the `Ad` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `Ad` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Ad" DROP CONSTRAINT "Ad_bundleId_fkey";

-- DropForeignKey
ALTER TABLE "Ad" DROP CONSTRAINT "Ad_serviceId_fkey";

-- AlterTable
ALTER TABLE "Ad" DROP COLUMN "bundleId",
DROP COLUMN "serviceId",
ADD COLUMN     "storeBundleId" TEXT,
ADD COLUMN     "storeServiceId" TEXT;

-- AddForeignKey
ALTER TABLE "Ad" ADD CONSTRAINT "Ad_storeServiceId_fkey" FOREIGN KEY ("storeServiceId") REFERENCES "StoreService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ad" ADD CONSTRAINT "Ad_storeBundleId_fkey" FOREIGN KEY ("storeBundleId") REFERENCES "StoreBundle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
