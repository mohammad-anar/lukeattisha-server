import express from "express";
import auth from "src/app/middlewares/auth.js";
import validateRequest from "src/app/middlewares/validateRequest.js";
import { Role } from "@prisma/client";
import { SubscriptionController } from "./subscription.controller.js";
import { SubscriptionValidation } from "./subscription.validation.js";

const router = express.Router();

// Packages (admin CRUD)
router.post(
  "/packages",
  auth(Role.ADMIN),
  validateRequest(SubscriptionValidation.createPackageSchema),
  SubscriptionController.createPackage
);

router.get("/packages", SubscriptionController.getAllPackages);

router.get("/packages/:id", SubscriptionController.getPackageById);

router.patch(
  "/packages/:id",
  auth(Role.ADMIN),
  validateRequest(SubscriptionValidation.updatePackageSchema),
  SubscriptionController.updatePackage
);

router.delete("/packages/:id", auth(Role.ADMIN), SubscriptionController.deletePackage);

// User subscriptions
router.post(
  "/subscribe",
  auth(Role.USER),
  validateRequest(SubscriptionValidation.subscribeSchema),
  SubscriptionController.subscribe
);

router.get("/me", auth(Role.USER), SubscriptionController.getMySubscription);

router.get("/all", auth(Role.ADMIN), SubscriptionController.getAllSubscriptions);

export const SubscriptionRouter = router;
