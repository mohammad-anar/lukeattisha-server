/*
  Warnings:

  - Added the required column `workshopName` to the `Workshop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Workshop" ADD COLUMN     "workshopName" TEXT NOT NULL;
