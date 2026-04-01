import { config } from "config/index.js";
import Stripe from "stripe";

export const stripe = new Stripe(config.stripe.stripe_sk as string, {
  apiVersion: "2026-02-25.clover",
});

export const createCheckoutSession = async (userId: string) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"], // Apple Pay & Google Pay automatically supported
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "Premium Subscription" },
          unit_amount: 999, // $9.99
        },
        quantity: 1,
      },
    ],
    success_url: `${config.frontend_url}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontend_url}/subscription-cancelled`,
    metadata: { userId },
  });

  return session.url;
};
export const createOrderPaymentSession = async (
  orderId: string,
  amount: number,
  userId: string,
  includeDeliveryFee: boolean = false,
) => {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  if (includeDeliveryFee) {
    // Separate main amount and delivery fee for clarity in Stripe UI
    const mainAmount = Math.max(0, amount - 4.99);
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: `Order Payment #${orderId.slice(0, 8)}`,
          description: "Payment for laundry services",
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
          description: "Fixed delivery charge",
        },
        unit_amount: 499, // $4.99
      },
      quantity: 1,
    });
  } else {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: `Order Payment #${orderId.slice(0, 8)}`,
          description: "Payment for laundry services (Free Delivery)",
        },
        unit_amount: Math.round(amount * 100),
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: lineItems,
    success_url: `${config.frontend_url}/payment-success?order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontend_url}/payment-cancelled?order_id=${orderId}`,
    metadata: { orderId, userId },
  });

  return session.url;
};
