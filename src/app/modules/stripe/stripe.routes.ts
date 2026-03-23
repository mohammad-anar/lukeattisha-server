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

// ---------------- OPERATOR PAYOUT ----------------
// Admin triggers a payout for an operator
router.post("/payout/create", auth(Role.ADMIN), StripeController.createPayout);

// Get all payouts for an operator
router.get(
  "/payout/:operatorId",
  auth(Role.ADMIN, Role.OPERATOR),
  StripeController.getPayouts,
);

// Update payout status
router.patch(
  "/payout/:id/status",
  auth(Role.ADMIN),
  StripeController.updatePayoutStatus,
);

export const StripeRouter = router;
