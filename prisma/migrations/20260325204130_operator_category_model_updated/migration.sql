/*
  Warnings:

  - The primary key for the `OperatorCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[operatorId,categoryId]` on the table `OperatorCategory` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `OperatorCategory` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "OperatorCategory" DROP CONSTRAINT "OperatorCategory_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "OperatorCategory_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "OperatorCategory_operatorId_categoryId_key" ON "OperatorCategory"("operatorId", "categoryId");
