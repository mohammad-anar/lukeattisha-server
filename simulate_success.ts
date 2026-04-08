
import { PrismaClient } from '@prisma/client';
import { PaymentService } from './src/app/modules/payment/payment.service.js';
import dotenv from 'dotenv';

dotenv.config();

async function simulateSuccess() {
  const prisma = new PrismaClient();
  const orderId = "cmnpbae010005tv1gi2xr4yen"; // Confirmed real order from your DB

  try {
    console.log(`[SIMULATION] Starting success simulation for Order: ${orderId}`);
    
    // 1. Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      console.error("[SIMULATION ❌ ERROR] Order not found in database.");
      return;
    }

    console.log(`[SIMULATION] Order found: ${order.orderNumber}. Current Payment Status: ${order.paymentStatus}`);

    // 2. Create a dummy Stripe session object as the webhook would receive
    const dummySession = {
      id: "cs_test_simulation_" + Date.now(),
      payment_intent: order.stripePaymentIntentId || "pi_simulated_success",
      metadata: {
        type: "ORDER_PAYMENT",
        orderId: order.id,
        userId: order.userId
      }
    };

    // 3. Manually trigger the success handler
    // We exported this specifically for this purpose
    console.log("[SIMULATION] Triggering handleMultiVendorOrderPaymentSuccess...");
    await PaymentService.handleMultiVendorOrderPaymentSuccess(orderId, dummySession);

    // 4. Verify results
    const updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true }
    });

    console.log("--------------------------------------------------");
    console.log("SIMULATION RESULTS:");
    console.log(`Order Status: ${updatedOrder?.status}`);
    console.log(`Order Payment Status: ${updatedOrder?.paymentStatus}`);
    console.log(`Payment Record Exists: ${!!updatedOrder?.payment}`);
    if (updatedOrder?.payment) {
        console.log(`Payment Record Status: ${updatedOrder.payment.status}`);
    }
    console.log("--------------------------------------------------");

    if (updatedOrder?.paymentStatus === 'PAID') {
        console.log("[SIMULATION ✅ SUCCESS] The backend logic correctly updated the order status!");
    } else {
        console.log("[SIMULATION ❌ FAILED] The order status is still not PAID.");
    }

  } catch (error: any) {
    console.error("[SIMULATION ❌ CRITICAL ERROR]:", error.message);
    if (error.stack) console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

simulateSuccess();
