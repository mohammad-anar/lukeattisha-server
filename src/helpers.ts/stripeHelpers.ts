import { config } from "../config/index.js";
import Stripe from "stripe";

export const stripe = new Stripe(config.stripe.stripe_sk as string, {
  apiVersion: "2023-10-16" as any, // Use a stable version for consistency
});

/**
 * Creates a Subscription Session for Users (Premium Subscription)
 * Includes a platform fee if necessary, but usually subscriptions go to platform
 */
export const createUserSubscriptionSession = async (
  userId: string,
  priceId: string,
  planId: string
) => {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      type: "USER_SUBSCRIPTION",
      userId,
      planId,
    },
    success_url: `${config.frontend_url}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontend_url}/subscription-cancelled`,
  } as any);

  return session.url;
};

/**
 * Creates a Subscription Session for Operators (Ad Subscription)
 */
export const createOperatorAdSubscriptionSession = async (
  operatorId: string,
  planId: string,
  planName: string,
  amount: number
) => {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${planName} - Ad Subscription`,
            description: `Ad subscription for ${planName} plan`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: "OPERATOR_AD_SUBSCRIPTION",
      operatorId,
      planId,
    },
    success_url: `${config.frontend_url}/operator/ad-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontend_url}/operator/ad-cancelled`,
  } as any);

  return session.url;
};

/**
 * Creates a standard Laundry Order Session
 */
export const createOrderPaymentSession = async (
  orderId: string,
  subtotal: number,
  deliveryFee: number,
  platformFeeAmount: number,
  userId: string,
  operatorConnectId: string | null,
  isSubscribed: boolean = false
) => {
  const lineItems: any[] = []; // Using any to bypass the type error while still functional

  lineItems.push({
    price_data: {
      currency: "usd",
      product_data: {
        name: `Order Payment #${orderId.slice(0, 8)}`,
        description: "Laundry Service",
      },
      unit_amount: Math.round(subtotal * 100),
    },
    quantity: 1,
  });

  if (deliveryFee > 0) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Delivery Fee",
          description: "Pickup & Delivery",
        },
        unit_amount: Math.round(deliveryFee * 100),
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: lineItems,
    payment_intent_data: {
      metadata: { orderId, userId, isSubscribed: String(isSubscribed) },
    },
    success_url: `${config.frontend_url}/payment-success?order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontend_url}/payment-cancelled?order_id=${orderId}`,
    metadata: {
      type: "ORDER_PAYMENT",
      orderId,
      userId,
      operatorConnectId: operatorConnectId || "",
    },
  } as any);

  return session;
};

/**
 * Setup Intent for saving a card without an immediate payment
 */
export const createSetupIntent = async (userId: string, customerId: string) => {
  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    automatic_payment_methods: { enabled: true },
    metadata: { userId },
  } as any);
  return setupIntent;
};

/**
 * Creates a Stripe Customer for a user if they don't have one
 */
export const createStripeCustomer = async (email: string, name: string, userId: string) => {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { userId },
  });
  return customer;
};

/**
 * Creates a standard Laundry Order Session with multi-vendor support (transfer_group)
 */
export const createMultiVendorOrderPaymentSession = async (
  orderId: string,
  totalAmount: number,
  userId: string,
  transferGroup: string
) => {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Order #${orderId.slice(0, 8)}`,
            description: "Multi-vendor Laundry Service",
          },
          unit_amount: Math.round(totalAmount * 100),
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      transfer_group: transferGroup,
      metadata: { orderId, userId },
    },
    success_url: `${config.frontend_url}/payment-success?order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontend_url}/payment-cancelled?order_id=${orderId}`,
    metadata: {
      type: "ORDER_PAYMENT",
      orderId,
      userId,
    },
  } as any);

  return session;
};

/**
 * Creates a transfer to a connected account
 */
export const createTransfer = async (
  amountInCents: number,
  destinationAccountId: string,
  transferGroup: string,
  metadata: any
) => {
  const transfer = await stripe.transfers.create({
    amount: amountInCents,
    currency: "usd",
    destination: destinationAccountId,
    transfer_group: transferGroup,
    metadata,
  });
  return transfer;
};

/**
 * Generates an Account Link for an Express Connect account
 */
export const generateAccountOnboardingLink = async (
  stripeConnectId: string,
  successUrl: string = `${config.frontend_url}/operator/onboarding-success`,
  refreshUrl: string = `${config.frontend_url}/operator/onboarding-failed`
) => {
  const accountLink = await stripe.accountLinks.create({
    account: stripeConnectId,
    refresh_url: refreshUrl,
    return_url: successUrl,
    type: "account_onboarding",
  });
  return accountLink;
};

/**
 * Creates a Connect Account
 */
export const createConnectAccount = async (email: string, name?: string) => {
  const account = await stripe.accounts.create({
    type: "express",
    email: email,
    business_profile: {
      support_email: email,
      ...(name && { name }),
    },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });
  return account.id;
};

/**
 * Retrieves a Connect Account details to check onboarding status
 */
export const getAccountStatus = async (accountId: string) => {
  const account = await stripe.accounts.retrieve(accountId);
  return {
    id: account.id,
    details_submitted: account.details_submitted,
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
    requirements: account.requirements,
  };
};

export const StripeHelpers = {
  createUserSubscriptionSession,
  createOperatorAdSubscriptionSession,
  createOrderPaymentSession,
  createMultiVendorOrderPaymentSession,
  createSetupIntent,
  createStripeCustomer,
  generateAccountOnboardingLink,
  createConnectAccount,
  getAccountStatus,
  createTransfer,
};