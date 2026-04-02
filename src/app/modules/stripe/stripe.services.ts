// src/app/modules/stripe/stripe.service.ts
import Stripe from "stripe";
import { PayoutStatus } from "@prisma/client";
import { stripe } from "../../../helpers.ts/stripeHelpers.js";
import { prisma } from "../../../helpers.ts/prisma.js";
import { config } from "../../../config/index.js";

const createCheckoutSession = async (userId: string, operatorId: string) => {
  const operator = await prisma.operatorProfile.findUnique({
    where: { id: operatorId },
  });

  if (!operator?.stripeConnectId) {
    throw new Error("Operator does not have a Stripe account connected.");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product: "prod_UFxTD5cYTIGJ5S",
          unit_amount: 9995, // $99.95
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    subscription_data: {
      application_fee_percent: 10,
      transfer_data: {
        destination: operator.stripeConnectId,
      },
      metadata: { userId, operatorId },
    },
    metadata: { userId, operatorId },
    success_url: `${config.frontend_url}/subscription/success`,
    cancel_url: `${config.frontend_url}/subscription/cancel`,
  });
  return session;
};

const handleWebhookEvent = async (event: Stripe.Event) => {
  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;
    
    if (account.details_submitted) {
      await prisma.operatorProfile.updateMany({
        where: { stripeConnectId: account.id },
        data: { 
          onboardingComplete: true,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled
        },
      });
    }
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // ==========================================
    // 1) SUBSCRIPTION PAYMENTS
    // ==========================================
    if (session.mode === "subscription") {
      const userId = session.metadata?.userId;
      if (!userId) return;

      // Find a package to link to, or create a default one to ensure DB consistency
      let pkg = await prisma.subscriptionPackage.findFirst({
        where: { name: "Premium Package" },
      });

      if (!pkg) {
        pkg = await prisma.subscriptionPackage.create({
          data: {
            name: "Premium Package",
            price: 99.95,
            durationDays: 30,
            freeDelivery: true,
          },
        });
      }

      // Save subscription in DB (initial record)
      await prisma.userSubscription.create({
        data: {
          userId,
          subscriptionType: "PREMIUM",
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          isActive: true,
          packageId: pkg.id,
        },
      });

      // Also update user's subscription status
      await prisma.user.update({
        where: { id: userId },
        data: { isSubscribed: true } as any,
      });
    }

    // ==========================================
    // 2) STANDARD ORDER PAYMENTS 
    // ==========================================
    else if (session.mode === "payment") {
      const orderId = session.metadata?.orderId;
      if (!orderId) return;

      // Update the Order status
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "ACCEPTED" },
      });

      // Record standard Payment as successful
      await prisma.payment.updateMany({
        where: { orderId },
        data: { 
          status: "PAID", 
          transactionId: typeof session.payment_intent === 'string' ? session.payment_intent : null
        },
      });

      // Log status change
      await prisma.orderStatusLog.create({
        data: {
          orderId,
          status: "ACCEPTED",
          note: "Payment successfully captured by Stripe Webhook",
        },
      });
    }
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object as any;
    const subscriptionId = invoice.subscription as string;

    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const userId = (subscription.metadata as any).userId;

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { isSubscribed: true } as any,
        });
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as any;
    const userId = (subscription.metadata as any).userId;

    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { isSubscribed: false } as any,
      });

      // Also deactivate in userSubscription table
      await prisma.userSubscription.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false },
      });
    }
  }
};


const createSetupIntentForUser = async (userId: string) => {
  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  if (!user.stripeCustomerId) {
    const customer = await stripe.customers.create({ email: user.email, name: user.name });
    user = await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id }
    });
  }

  const setupIntent = await stripe.setupIntents.create({
    customer: user.stripeCustomerId!,
    payment_method_types: ["card"],
    usage: 'off_session', 
  });

  return { clientSecret: setupIntent.client_secret };
};

export const StripeService = {
  createCheckoutSession,
  handleWebhookEvent,
  createSetupIntentForUser,
};
