-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "pickupLatitude" DROP NOT NULL,
ALTER COLUMN "pickupLongitude" DROP NOT NULL,
ALTER COLUMN "dropoffLatitude" DROP NOT NULL,
ALTER COLUMN "dropoffLongitude" DROP NOT NULL;
