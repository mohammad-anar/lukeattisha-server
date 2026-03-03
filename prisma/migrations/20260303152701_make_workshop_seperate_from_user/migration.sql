/*
  Warnings:

  - You are about to drop the column `userId` on the `Workshop` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Workshop` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `Workshop` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Workshop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Workshop` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Workshop" DROP CONSTRAINT "Workshop_userId_fkey";

-- DropIndex
DROP INDEX "Workshop_userId_key";

-- AlterTable
ALTER TABLE "Workshop" DROP COLUMN "userId",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Workshop_email_key" ON "Workshop"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Workshop_phone_key" ON "Workshop"("phone");

-- CreateIndex
CREATE INDEX "Workshop_approvalStatus_idx" ON "Workshop"("approvalStatus");
