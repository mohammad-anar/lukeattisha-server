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
  userId: string
) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Order Payment #${orderId.slice(0, 8)}`,
            description: "Payment for laundry services",
          },
          unit_amount: Math.round(amount * 100), // convert to cents
        },
        quantity: 1,
      },
    ],
    success_url: `${config.frontend_url}/payment-success?order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontend_url}/payment-cancelled?order_id=${orderId}`,
    metadata: { orderId, userId },
  });

  return session.url;
};
