// src/app/modules/stripe/stripe.routes.ts
import express from "express";
import { StripeController } from "./stripe.controller.js";
import { Role } from "@prisma/client";
import auth from "app/middlewares/auth.js";

const router = express.Router();

// ---------------- SUBSCRIPTION ----------------
// Create a checkout session (Apple Pay / Google Pay included)
router.post(
  "/subscription/create-session",
  auth(Role.USER, Role.ADMIN),
  StripeController.createCheckoutSession,
);

// Stripe webhook to handle subscription payment success
router.post(
  "/subscription/webhook",
  express.raw({ type: "application/json" }), // Required for Stripe signature verification
  StripeController.handleWebhook,
);


router.post(
  "/setup-intent",
  auth(Role.USER, Role.ADMIN),
  StripeController.createSetupIntent
);

export const StripeRouter = router;
