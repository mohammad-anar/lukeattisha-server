/*
  Warnings:

  - The `userID` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "userID",
ADD COLUMN     "userID" SERIAL;

-- CreateIndex
CREATE UNIQUE INDEX "User_userID_key" ON "User"("userID");
