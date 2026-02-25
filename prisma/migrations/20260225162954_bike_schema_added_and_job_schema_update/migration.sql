/*
  Warnings:

  - You are about to drop the column `budgetMax` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `budgetMin` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `priceMax` on the `JobOffer` table. All the data in the column will be lost.
  - You are about to drop the column `priceMin` on the `JobOffer` table. All the data in the column will be lost.
  - You are about to drop the column `priceType` on the `JobOffer` table. All the data in the column will be lost.
  - Made the column `scheduleEnd` on table `Booking` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `bikeName` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bikeType` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `radius` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Made the column `latitude` on table `Job` required. This step will fail if there are existing NULL values in that column.
  - Made the column `longitude` on table `Job` required. This step will fail if there are existing NULL values in that column.
  - Made the column `preferredTime` on table `Job` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `price` to the `JobOffer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Urgency" AS ENUM ('LOW', 'MEDIUM', 'HEIGH');

-- CreateEnum
CREATE TYPE "BikeType" AS ENUM ('ROAD', 'MOUNTAIN', 'HYBRID', 'ELECTRIC', 'BMX', 'GRAVEL', 'CRUISER', 'OTHER');

-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "scheduleEnd" SET NOT NULL;

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "budgetMax",
DROP COLUMN "budgetMin",
ADD COLUMN     "bikeBrand" TEXT,
ADD COLUMN     "bikeId" TEXT,
ADD COLUMN     "bikeName" TEXT NOT NULL,
ADD COLUMN     "bikeType" "BikeType" NOT NULL,
ADD COLUMN     "radius" INTEGER NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "urgency" "Urgency" NOT NULL DEFAULT 'MEDIUM',
ALTER COLUMN "latitude" SET NOT NULL,
ALTER COLUMN "longitude" SET NOT NULL,
ALTER COLUMN "preferredTime" SET NOT NULL;

-- AlterTable
ALTER TABLE "JobOffer" DROP COLUMN "priceMax",
DROP COLUMN "priceMin",
DROP COLUMN "priceType",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "Bike" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BikeType" NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "color" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bike_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Bike" ADD CONSTRAINT "Bike_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_bikeId_fkey" FOREIGN KEY ("bikeId") REFERENCES "Bike"("id") ON DELETE SET NULL ON UPDATE CASCADE;
