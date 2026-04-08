
import { PrismaClient } from '@prisma/client';

async function listPayments() {
  const prisma = new PrismaClient();
  try {
    const payments = await prisma.payment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { order: true }
    });
    console.log(`Found ${payments.length} recent payments.`);
    payments.forEach(p => {
        console.log(`- ID: ${p.id}, OrderID: ${p.orderId}, Status: ${p.status}, PI: ${p.stripePaymentIntentId}`);
    });

    const specificPayment = await prisma.payment.findFirst({
        where: { orderId: "cmnpaipdn000htvcg0l67zk1c" }
    });
    if (specificPayment) {
        console.log("Specific payment found directly!");
    } else {
        console.log("Specific payment NOT found directly by orderId.");
    }
  } catch (error: any) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}
listPayments();
