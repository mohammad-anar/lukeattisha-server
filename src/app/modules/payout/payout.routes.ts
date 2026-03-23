import express from "express";
import { PayoutController } from "./payout.controller.js";
import auth from "src/app/middlewares/auth.js";
import { Role } from "@prisma/client";

const router = express.Router();

// Create a payout (admin only)
router.post("/", auth(Role.ADMIN), PayoutController.createPayout);

// Get all payouts for an operator
router.get(
  "/:operatorId",
  auth(Role.ADMIN, Role.OPERATOR),
  PayoutController.getPayouts,
);

// Update payout status (admin only)
router.patch(
  "/:id/status",
  auth(Role.ADMIN),
  PayoutController.updatePayoutStatus,
);

export const PayoutRouter = router;
