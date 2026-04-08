
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const plans = await prisma.adSubscriptionPlan.findMany();
  console.log('Ad Subscription Plans:', JSON.stringify(plans, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
