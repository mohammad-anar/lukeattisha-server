
import { PrismaClient } from '@prisma/client';

async function listOrders() {
  const prisma = new PrismaClient();
  try {
    const orders = await prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { payment: true }
    });
    console.log(`Found ${orders.length} recent orders.`);
    orders.forEach(o => {
        console.log(`- ID: ${o.id}, Num: ${o.orderNumber}, Status: ${o.status}, PaymentStatus: ${o.paymentStatus}, PaymentExists: ${!!o.payment}`);
    });
  } catch (error: any) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}
listOrders();
