/*
  Warnings:

  - The values [FULL,HALF,SMALL] on the enum `BannerType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BannerType_new" AS ENUM ('PROMOTION', 'MEMBERSHIP', 'SESSIONAL', 'OFFER');
ALTER TABLE "public"."Banner" ALTER COLUMN "bannerType" DROP DEFAULT;
ALTER TABLE "Banner" ALTER COLUMN "bannerType" TYPE "BannerType_new" USING ("bannerType"::text::"BannerType_new");
ALTER TYPE "BannerType" RENAME TO "BannerType_old";
ALTER TYPE "BannerType_new" RENAME TO "BannerType";
DROP TYPE "public"."BannerType_old";
ALTER TABLE "Banner" ALTER COLUMN "bannerType" SET DEFAULT 'PROMOTION';
COMMIT;

-- AlterTable
ALTER TABLE "Banner" ADD COLUMN     "backgroundColor" TEXT DEFAULT '#FFFFFF',
ADD COLUMN     "buttonText" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "textColor" TEXT DEFAULT '#000000',
ALTER COLUMN "bannerType" SET DEFAULT 'PROMOTION';
