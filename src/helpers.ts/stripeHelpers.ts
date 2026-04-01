import { config } from "config/index.js";
import Stripe from "stripe";

export const stripe = new Stripe(config.stripe.stripe_sk as string, {
  apiVersion: "2023-10-16" as any, // Use a stable version for consistency
});

/**
 * Creates a Subscription Session ($99.95)
 * Logic: 10% stays with Admin, 90% goes to Operator
 */
export const createPremiumSubscriptionSession = async (
  userId: string, 
  operatorId: string
) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription", // MUST be subscription for recurring billing
    line_items: [
      {
        // Use the Price ID (price_...) you found in your Stripe Dashboard
        price: config.stripe.premium_price_id as string, 
        quantity: 1,
      },
    ],
    subscription_data: {
      application_fee_percent: 10, // Your 10% platform fee
      transfer_data: {
        destination: operatorId, // The connected Stripe account ID of the laundry shop
      },
      metadata: { userId }, // Metadata inside the subscription object
    },
    metadata: { userId }, // Metadata at the session level for the webhook
    success_url: `${config.frontend_url}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontend_url}/subscription-cancelled`,
  });

  return session.url;
};

/**
 * Creates a standard Laundry Order Session
 * Logic: Handles the $4.99 waiver based on includeDeliveryFee
 */
export const createOrderPaymentSession = async (
  orderId: string,
  amount: number,
  userId: string,
  operatorAccountId: string, // REQUIRED for destination transfer
  isSubscribed: boolean = false,
) => {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  // Logic: Non-subscribers pay the $4.99 fee themselves
  if (!isSubscribed) {
    const mainAmount = Math.max(0, amount - 4.99); 
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: `Order Payment #${orderId.slice(0, 8)}`,
          description: "Laundry Service",
        },
        unit_amount: Math.round(mainAmount * 100),
      },
      quantity: 1,
    });

    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Delivery Fee",
          description: "Pickup & Delivery",
        },
        unit_amount: 499,
      },
      quantity: 1,
    });
  } else {
    // Subscribers have the fee omitted from their checkout
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: `Order Payment #${orderId.slice(0, 8)}`,
          description: "Laundry Service (Premium Free Delivery)",
        },
        unit_amount: Math.round(amount * 100),
      },
      quantity: 1,
    });
  }

  // Calculate 10% Platform Fee based on what the user pays
  const applicationFeeAmount = Math.round(amount * 100 * 0.10);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: lineItems,
    payment_intent_data: {
      application_fee_amount: applicationFeeAmount,
      transfer_data: {
        destination: operatorAccountId,
      },
      metadata: { orderId, userId, isSubscribed: String(isSubscribed) },
    },
    success_url: `${config.frontend_url}/payment-success?order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontend_url}/payment-cancelled?order_id=${orderId}`,
    metadata: { 
      orderId, 
      userId,
      isSubscribed: String(isSubscribed),
      operatorAccountId
    },
  });

  return session.url;
};

/**
 * Creates a payout (Transfer) from the platform balance to a Connected Account
 */
export const createStripeTransfer = async (
  amount: number,
  destinationAccountId: string,
  metadata?: Stripe.Metadata,
) => {
  return await stripe.transfers.create({
    amount: Math.round(amount * 100), // in cents
    currency: "usd",
    destination: destinationAccountId,
    metadata,
  });
};

/**
 * Creates a new Stripe Connected Account for an Operator
 */
export const createStripeAccount = async (email: string) => {
  const account = await stripe.accounts.create({
    type: "express", // Express is easier for user-friendly onboarding
    email: email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });
  return account.id;
};