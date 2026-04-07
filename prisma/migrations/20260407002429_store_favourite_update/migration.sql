/*
  Warnings:

  - You are about to drop the column `bundleId` on the `FavouriteService` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "FavouriteService" DROP CONSTRAINT "FavouriteService_bundleId_fkey";

-- AlterTable
ALTER TABLE "FavouriteService" DROP COLUMN "bundleId",
ADD COLUMN     "storeBundleId" TEXT,
ADD COLUMN     "storeServiceId" TEXT;

-- AddForeignKey
ALTER TABLE "FavouriteService" ADD CONSTRAINT "FavouriteService_storeServiceId_fkey" FOREIGN KEY ("storeServiceId") REFERENCES "StoreService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteService" ADD CONSTRAINT "FavouriteService_storeBundleId_fkey" FOREIGN KEY ("storeBundleId") REFERENCES "StoreBundle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
