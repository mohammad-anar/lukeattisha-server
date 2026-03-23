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

