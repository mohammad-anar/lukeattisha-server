/*
  Warnings:

  - You are about to drop the column `serviceId` on the `Service` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Service_serviceId_key";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "serviceId";
