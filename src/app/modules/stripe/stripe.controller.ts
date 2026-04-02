// src/app/modules/stripe/stripe.controller.ts
import { Request, Response } from "express";
import Stripe from "stripe";
import { StripeService } from "./stripe.services.js";
import catchAsync from "app/shared/catchAsync.js";
import sendResponse from "app/shared/sendResponse.js";

/* ================= CREATE CHECKOUT SESSION ================= */
const createCheckoutSession = catchAsync(async (req: any, res: Response) => {
  const { operatorId } = req.body;
  const session = await StripeService.createCheckoutSession(
    req.user.id,
    operatorId as string,
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Checkout session created successfully",
    data: session.url,
  });
});

/* ================= HANDLE STRIPE WEBHOOK ================= */
const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const sig = req.headers["stripe-signature"]!;

  let event: Stripe.Event;

  try {
    event = Stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  await StripeService.handleWebhookEvent(event);
  res.json({ received: true });
});


/* ================= GET SETUP INTENT ================= */
const createSetupIntent = catchAsync(async (req: Request, res: Response) => {
  const result = await StripeService.createSetupIntentForUser(req.user.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "SetupIntent created successfully",
    data: result,
  });
});

export const StripeController = {
  createCheckoutSession,
  handleWebhook,
  createSetupIntent,
};
