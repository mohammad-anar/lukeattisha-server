import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const ads = await prisma.ad.deleteMany({
    where: {
      storeServiceId: null,
      storeBundleId: null
    }
  });
  console.log('Deleted corrupt Ads:', ads.count);
}
main().catch(console.error).finally(() => prisma.$disconnect());
