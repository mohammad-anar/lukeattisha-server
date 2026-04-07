/*
  Warnings:

  - The values [SESSIONAL] on the enum `BannerType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BannerType_new" AS ENUM ('PROMOTION', 'MEMBERSHIP', 'SEASONAL', 'OFFER');
ALTER TABLE "public"."Banner" ALTER COLUMN "bannerType" DROP DEFAULT;
ALTER TABLE "Banner" ALTER COLUMN "bannerType" TYPE "BannerType_new" USING ("bannerType"::text::"BannerType_new");
ALTER TYPE "BannerType" RENAME TO "BannerType_old";
ALTER TYPE "BannerType_new" RENAME TO "BannerType";
DROP TYPE "public"."BannerType_old";
ALTER TABLE "Banner" ALTER COLUMN "bannerType" SET DEFAULT 'PROMOTION';
COMMIT;
