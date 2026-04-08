
import { PrismaClient } from '@prisma/client';

async function inspectOrder() {
  const prisma = new PrismaClient();
  const targetOrderId = "cmnpaipdn000htvcg0l67zk1c";
  try {
    const order = await prisma.order.findUnique({
        where: { id: targetOrderId }
    });
    if (order) {
        console.log("Order found!");
        console.log("Payment URL in DB:", order.paymentUrl);
        console.log("PI ID in DB:", order.stripePaymentIntentId);
    } else {
        console.log("Order NOT found!");
    }
  } catch (error: any) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}
inspectOrder();
