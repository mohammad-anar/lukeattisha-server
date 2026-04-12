import { prisma } from './src/helpers.ts/prisma.js';

async function getPlans() {
  const plans = await prisma.adSubscriptionPlan.findMany();
  console.log(JSON.stringify(plans, null, 2));
}

getPlans();
