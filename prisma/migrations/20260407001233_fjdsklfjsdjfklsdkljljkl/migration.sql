-- DropForeignKey
ALTER TABLE "FavouriteService" DROP CONSTRAINT "FavouriteService_serviceId_fkey";

-- AlterTable
ALTER TABLE "FavouriteService" ADD COLUMN     "bundleId" TEXT,
ALTER COLUMN "serviceId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "FavouriteService" ADD CONSTRAINT "FavouriteService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteService" ADD CONSTRAINT "FavouriteService_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
