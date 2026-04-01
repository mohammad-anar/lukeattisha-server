import express from "express";
import { Role } from "@prisma/client";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { ServiceBundleController } from "./serviceBundle.controller.js";
import { ServiceBundleValidation } from "./serviceBundle.validation.js";
import fileUploadHandler from "app/middlewares/fileUploadHandler.js";

const router = express.Router();

router.get("/", ServiceBundleController.getAllServiceBundles);
router.get("/:id", ServiceBundleController.getServiceBundleById);

router.post(
  "/",
  auth(Role.OPERATOR),
  fileUploadHandler(),
  validateRequest(ServiceBundleValidation.createServiceBundleSchema),
  ServiceBundleController.createServiceBundle
);

router.patch(
  "/:id",
  auth(Role.OPERATOR),
  fileUploadHandler(),
  validateRequest(ServiceBundleValidation.updateServiceBundleSchema),
  ServiceBundleController.updateServiceBundle
);

router.delete(
  "/:id",
  auth(Role.OPERATOR),
  ServiceBundleController.deleteServiceBundle
);

export const ServiceBundleRoutes = router;
