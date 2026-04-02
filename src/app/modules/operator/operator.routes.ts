import express from "express";
import { Role } from "@prisma/client";
import { OperatorController } from "./operator.controller.js";
import { OperatorValidation } from "./operator.validation.js";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";

const router = express.Router();

router.post(
  "/profile",
  auth(Role.OPERATOR),
  validateRequest(OperatorValidation.createProfileZodSchema),
  OperatorController.createProfile
);

router.get("/profile", auth(Role.OPERATOR), OperatorController.getMyProfile);

router.get("/onboarding-link", auth(Role.OPERATOR), OperatorController.getOnboardingLink);

router.patch(
  "/profile",
  auth(Role.OPERATOR),
  validateRequest(OperatorValidation.updateProfileZodSchema),
  OperatorController.updateProfile
);

router.post(
  "/categories",
  auth(Role.OPERATOR),
  validateRequest(OperatorValidation.assignCategoriesZodSchema),
  OperatorController.assignCategories
);

// get operator categories
router.get(
  "/categories",
  auth(Role.OPERATOR, Role.ADMIN, Role.USER),
  OperatorController.getOperatorCategories
);

// remove operator categories
router.delete(
  "/categories/:id",
  auth(Role.OPERATOR, Role.ADMIN),
  OperatorController.removeCategory
);

// Admins and Users can see operators
router.get(
  "/",
  auth(Role.ADMIN, Role.USER),
  OperatorController.getAllOperators
);

router.get(
  "/:id",
  auth(Role.ADMIN, Role.USER),
  OperatorController.getOperatorById
);

export const OperatorRouter = router;
