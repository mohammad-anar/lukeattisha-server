import express from "express";
import { Role } from "@prisma/client";
import { ServiceController } from "./service.controller.js";
import { ServiceValidation } from "./service.validation.js";
import auth from "app/middlewares/auth.js";
import validateRequest from "app/middlewares/validateRequest.js";

const router = express.Router();

router.post(
  "/",
  auth(Role.OPERATOR),
  validateRequest(ServiceValidation.createServiceZodSchema),
  ServiceController.createService
);

router.get(
  "/",
  auth(Role.ADMIN, Role.USER, Role.OPERATOR),
  ServiceController.getAllServices
);

router.get(
  "/operator/:operatorId",
  auth(Role.ADMIN, Role.USER, Role.OPERATOR),
  ServiceController.getServicesByOperator
);

router.get(
  "/:id",
  auth(Role.ADMIN, Role.USER, Role.OPERATOR),
  ServiceController.getServiceById
);

router.patch(
  "/:id",
  auth(Role.OPERATOR),
  validateRequest(ServiceValidation.updateServiceZodSchema),
  ServiceController.updateService
);

router.delete(
  "/:id",
  auth(Role.OPERATOR),
  ServiceController.deleteService
);

// Addons
router.post(
  "/:serviceId/addons",
  auth(Role.OPERATOR),
  validateRequest(ServiceValidation.createAddonZodSchema),
  ServiceController.createAddon
);

router.get(
  "/addons/:id",
  auth(Role.ADMIN, Role.USER, Role.OPERATOR),
  ServiceController.getAddonById
);

router.get(
  "/addons/:serviceId/get-all",
  auth(Role.ADMIN, Role.USER, Role.OPERATOR),
  ServiceController.getAddonsByServiceId
);

router.patch(
  "/addons/:id",
  auth(Role.OPERATOR),
  validateRequest(ServiceValidation.updateAddonZodSchema),
  ServiceController.updateAddon
);

router.delete(
  "/addons/:id",
  auth(Role.OPERATOR),
  ServiceController.deleteAddon
);

export const ServiceRouter = router;
