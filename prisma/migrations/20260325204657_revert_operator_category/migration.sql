/*
  Warnings:

  - The primary key for the `OperatorCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `OperatorCategory` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "OperatorCategory_operatorId_categoryId_key";

-- AlterTable
ALTER TABLE "OperatorCategory" DROP CONSTRAINT "OperatorCategory_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "OperatorCategory_pkey" PRIMARY KEY ("operatorId", "categoryId");
