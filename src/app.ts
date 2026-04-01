import cors from "cors";
import express, { Application, Request, Response } from "express";
import router from "./app/routes/index.js";
import globalErrorHandler from "./app/middlewares/globalErrorHandler.js";
import notFound from "./app/middlewares/notFound.js";
import { getIO } from "./helpers.ts/socketHelper.js";

import Stripe from "stripe";
import { prisma } from "./helpers.ts/prisma.js";
import { stripe } from "./helpers.ts/stripeHelpers.js";
import { config } from "config/index.js";

const endpointSecret = config.stripe.stripe_webhook_secret as string;

const app: Application = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.static("uploads"));

// ---------- 1. WEBHOOK (Must stay BEFORE express.json()) ----------
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret);
      console.log(`✅ Webhook Verified: ${event.type}`);
    } catch (err: any) {
      console.error(`❌ Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
  const session = event.data.object as Stripe.Checkout.Session;

  // 1. Extract metadata (Ensure these were passed during session creation)
  const userId = session.metadata?.userId;
  const orderId = session.metadata?.orderId;
  const packageId = session.metadata?.packageId;
  const isSubscribed = session.metadata?.isSubscribed === "true";
  const operatorAccountId = session.metadata?.operatorAccountId;

  console.log(`Processing Session: Mode=${session.mode}, User=${userId}, Order=${orderId}, Package=${packageId}`);

  // --- HANDLE LAUNDRY ORDER (One-time Payment) ---
  if (session.mode === "payment" && orderId) {
    await prisma.$transaction([
      // Update payment record
      prisma.payment.updateMany({
        where: { orderId },
        data: {
          status: "PAID",
          stripePaymentIntentId: session.payment_intent as string,
        },
      }),
      // Log the status change
      prisma.orderStatusLog.create({
        data: {
          orderId,
          status: "ACCEPTED",
          note: "Payment confirmed via Stripe. Order accepted.",
        },
      }),
      // Update order status
      prisma.order.update({
        where: { id: orderId },
        data: { status: "ACCEPTED" },
      }),
    ]);

    console.log(`✅ Order ${orderId} marked as PAID and ACCEPTED.`);

    // --- SUBSIDY LOGIC (If user is Premium, Platform pays the Operator) ---
    if (isSubscribed && operatorAccountId) {
      console.log(`Subsidizing delivery fee for subscriber user ${userId}`);
      const subsidyAmount = 4.49; // $4.99 minus your 10% cut

      try {
        // Dynamic import to avoid circular dependency
        const { createStripeTransfer } = await import("./helpers.ts/stripeHelpers.js");
        await createStripeTransfer(subsidyAmount, operatorAccountId, { 
          orderId, 
          type: "delivery_subsidy" 
        });
        console.log(`✅ Subsidy transfer of $${subsidyAmount} sent to operator ${operatorAccountId}`);
      } catch (transferErr) {
        console.error("❌ Subsidy transfer failed:", transferErr);
        // Note: You might want to log this to a 'FailedTransfers' table
      }
    }
  }

  // --- HANDLE SUBSCRIPTION PACKAGE ($99.95 / Premium) ---
  if (session.mode === "subscription" && userId && packageId) {
    // 1. Find the specific package from your DB
    const pkg = await prisma.subscriptionPackage.findUnique({
      where: { id: packageId },
    });

    if (pkg) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + pkg.durationDays);

      await prisma.$transaction([
        // Update user profile flag
        prisma.user.update({
          where: { id: userId },
          data: { isSubscribed: true },
        }),
        // Create or Update the subscription record (Upsert is safer)
        prisma.userSubscription.upsert({
          where: { userId: userId },
          update: {
            packageId: pkg.id,
            startDate,
            endDate,
            isActive: true,
            stripeSubscriptionId: session.subscription as string,
          },
          create: {
            userId,
            packageId: pkg.id,
            startDate,
            endDate,
            isActive: true,
            stripeSubscriptionId: session.subscription as string,
          },
        }),
      ]);
      console.log(`✅ User ${userId} successfully upgraded to ${pkg.name}.`);
    } else {
      console.error(`❌ Webhook Error: Package ID ${packageId} not found in database.`);
    }
  }
}
    res.json({ received: true });
  }
);

// ---------- 2. PARSERS (Must stay AFTER webhook) ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- 3. ROUTES ----------
app.use("/api/v1", router);

app.get("/", (req, res) => res.send({ status: "Server Running" }));
app.use(globalErrorHandler);
app.use(notFound);

export default app;