-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_storeServiceId_fkey";

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "storeBundleId" TEXT,
ALTER COLUMN "storeServiceId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_storeServiceId_fkey" FOREIGN KEY ("storeServiceId") REFERENCES "StoreService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_storeBundleId_fkey" FOREIGN KEY ("storeBundleId") REFERENCES "StoreBundle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
