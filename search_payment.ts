
import { PrismaClient } from '@prisma/client';

async function searchPaymentByUrl() {
  const prisma = new PrismaClient();
  const targetOrderId = "cmnpaipdn000htvcg0l67zk1c";
  try {
    const payments = await prisma.payment.findMany({
        where: {
            paymentUrl: {
                contains: targetOrderId
            }
        }
    });
    console.log(`Found ${payments.length} payments with URL containing '${targetOrderId}'`);
    payments.forEach(p => {
        console.log(`- ID: ${p.id}, OrderID: ${p.orderId}, Status: ${p.status}`);
    });
  } catch (error: any) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}
searchPaymentByUrl();
