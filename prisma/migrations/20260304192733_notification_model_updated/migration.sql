/*
  Warnings:

  - The values [HEIGH] on the enum `Urgency` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `userId` on the `Notification` table. All the data in the column will be lost.
  - Made the column `jobId` on table `Notification` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Urgency_new" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
ALTER TABLE "public"."Job" ALTER COLUMN "urgency" DROP DEFAULT;
ALTER TABLE "Job" ALTER COLUMN "urgency" TYPE "Urgency_new" USING ("urgency"::text::"Urgency_new");
ALTER TYPE "Urgency" RENAME TO "Urgency_old";
ALTER TYPE "Urgency_new" RENAME TO "Urgency";
DROP TYPE "public"."Urgency_old";
ALTER TABLE "Job" ALTER COLUMN "urgency" SET DEFAULT 'MEDIUM';
COMMIT;

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_jobId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "userId",
ADD COLUMN     "workshopIds" TEXT[],
ALTER COLUMN "jobId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
