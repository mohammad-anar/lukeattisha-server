import express from "express";
import { PayoutController } from "./payout.controller.js";
import { Role } from "@prisma/client";
import auth from "app/middlewares/auth.js";

const router = express.Router();

// Create a payout (Operator requests, Admin can also create)
router.post("/", auth(Role.ADMIN, Role.OPERATOR), PayoutController.createPayout);

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
