// src/app/modules/stripe/stripe.service.ts
import Stripe from "stripe";
import { PayoutStatus } from "@prisma/client";
import { stripe } from "helpers.ts/stripeHelpers.js";
import { prisma } from "helpers.ts/prisma.js";

const createCheckoutSession = async (userId: string) => {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"], // only card works reliably
    line_items: [{ price: process.env.STRIPE_PREMIUM_PRICE_ID!, quantity: 1 }],
    metadata: { userId },
    success_url: `${process.env.CLIENT_URL}/subscription/success`,
    cancel_url: `${process.env.CLIENT_URL}/subscription/cancel`,
  });
  return session;
};

const handleWebhookEvent = async (event: Stripe.Event) => {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;

    if (!userId) return;

    // Save subscription in DB
    await prisma.userSubscription.create({
      data: {
        userId,
        subscriptionType: "PREMIUM",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActive: true,
        packageId: "", // If you have predefined packages, set the ID here
      },
    });
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
