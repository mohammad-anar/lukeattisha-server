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

  if (!operator?.stripeAccountId) {
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
        destination: operator.stripeAccountId,
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
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const operatorId = session.metadata?.operatorId;

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

const createPayout = async (operatorId: string, amount: number) => {
  // 1️⃣ Find operator
  const operator = await prisma.operatorProfile.findUnique({
    where: { id: operatorId },
  });

  if (!operator?.stripeAccountId)
    throw new Error("Operator Stripe account not found");

  // 2️⃣ Find operator's wallet
  const wallet = await prisma.wallet.findUnique({
    where: { userId: operator.userId },
  });

  if (!wallet) throw new Error("Operator wallet not found");

  // 3️⃣ Create Stripe payout
  const stripePayout = await stripe.payouts.create(
    {
      amount: Math.floor(amount * 100),
      currency: "usd",
      method: "standard",
    },
    {
      stripeAccount: operator.stripeAccountId,
    },
  );

  return await prisma.payout.create({
    data: {
      operatorId,
      walletId: wallet.id,
      amount,
      status: "PENDING",
    },
  });
};

const getPayoutsByOperator = async (operatorId: string) => {
  return await prisma.payout.findMany({ where: { operatorId } });
};

const updatePayoutStatus = async (id: string, status: PayoutStatus) => {
  return await prisma.payout.update({ where: { id }, data: { status } });
};

export const StripeService = {
  createCheckoutSession,
  handleWebhookEvent,
  createPayout,
  getPayoutsByOperator,
  updatePayoutStatus,
};
