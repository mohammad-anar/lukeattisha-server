import express from "express";
import { WalletController } from "./wallet.controller.js";
import auth from "src/app/middlewares/auth.js";
import { Role } from "@prisma/client";

const router = express.Router();

// Get wallet by user
router.get("/:userId", auth(Role.USER, Role.ADMIN), WalletController.getWallet);

// Add funds to wallet
router.post(
  "/:userId/add",
  auth(Role.USER, Role.ADMIN),
  WalletController.addFunds,
);

// Deduct funds from wallet
router.post(
  "/:userId/deduct",
  auth(Role.USER, Role.ADMIN),
  WalletController.deductFunds,
);

export const WalletRouter = router;
