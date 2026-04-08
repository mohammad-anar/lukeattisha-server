
import { PrismaClient } from '@prisma/client';

async function checkStatus() {
  const prisma = new PrismaClient();
  const orderId = "cmnpaipdn000htvcg0l67zk1c"; // From user's previous message

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true, operatorOrders: true }
    });

    if (!order) {
      console.log("Order not found:", orderId);
      return;
    }

    console.log("Order Status:", order.status);
    console.log("Order Payment Status:", order.paymentStatus);
    if (order.payment) {
      console.log("Payment Status:", order.payment.status);
      console.log("Payment PI ID:", order.payment.stripePaymentIntentId);
    } else {
      console.log("Payment record MISSING for this order.");
    }
    console.log("Operator Orders Count:", order.operatorOrders.length);

  } catch (error: any) {
    console.error("Error checking status:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkStatus();
