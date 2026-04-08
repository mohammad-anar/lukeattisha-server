
import { PrismaClient } from '@prisma/client';

async function checkPaymentByPI() {
  const prisma = new PrismaClient();
  const targetOrderId = "cmnpaipdn000htvcg0l67zk1c";
  try {
    const order = await prisma.order.findUnique({
        where: { id: targetOrderId }
    });
    if (!order || !order.stripePaymentIntentId) {
        console.log("No PI ID in order.");
        return;
    }
    
    console.log(`Searching for Payment with PI ID: ${order.stripePaymentIntentId}`);
    const payment = await prisma.payment.findUnique({
        where: { stripePaymentIntentId: order.stripePaymentIntentId }
    });

    if (payment) {
        console.log("Payment FOUND by PI ID!");
        console.log("Payment record's orderId:", payment.orderId);
        console.log("Target orderId:", targetOrderId);
    } else {
        console.log("Payment STILL NOT found by PI ID.");
    }
  } catch (error: any) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}
checkPaymentByPI();
