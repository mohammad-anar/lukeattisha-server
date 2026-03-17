import express from "express";
import auth from "src/app/middlewares/auth.js";
import validateRequest from "src/app/middlewares/validateRequest.js";
import { Role } from "@prisma/client";
import { OperatorController } from "./operator.controller.js";
import { OperatorValidation } from "./operator.validation.js";

const router = express.Router();

router.post(
  "/profile",
  auth(Role.OPERATOR),
  validateRequest(OperatorValidation.createProfileZodSchema),
  OperatorController.createProfile
);

router.get("/profile", auth(Role.OPERATOR), OperatorController.getMyProfile);

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
