import express from "express";
import { AddonController } from "./addon.controller.js";
import { AddonValidation } from "./addon.validation.js";
import { Role } from "@prisma/client";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";

const router = express.Router();

router.post(
  "/",
  auth(Role.OPERATOR),
  validateRequest(AddonValidation.createAddonZodSchema),
  AddonController.createAddon
);


router.get("/my-addons", auth(Role.OPERATOR), AddonController.getMyAddons);


router.get("/:id", AddonController.getAddonById);

router.patch(
  "/:id",
  auth(Role.OPERATOR),
  validateRequest(AddonValidation.updateAddonZodSchema),
  AddonController.updateAddon
);

router.delete("/:id", auth(Role.OPERATOR), AddonController.deleteAddon);

export const AddonRoutes = router;
