import express from "express";
import { Role } from "@prisma/client";
import auth from "src/app/middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { PlatformDataController } from "./platformData.controller.js";
import { PlatformDataValidation } from "./platformData.validation.js";

const router = express.Router();

// Public: anyone can GET the platform settings (e.g. for fee display)
router.get("/", PlatformDataController.getPlatformData);

// Admin-only: update platform fee and maximum job radius
router.patch(
  "/",
  auth(Role.ADMIN),
  validateRequest(PlatformDataValidation.update),
  PlatformDataController.updatePlatformData,
);

export const PlatformDataRouter = router;
