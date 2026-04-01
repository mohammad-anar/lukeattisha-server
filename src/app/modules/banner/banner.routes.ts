import express from "express";
import { Role } from "@prisma/client";
import { BannerController } from "./banner.controller.js";
import { BannerValidation } from "./banner.validation.js";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";

const router = express.Router();

router.post(
  "/",
  auth(Role.ADMIN),
  validateRequest(BannerValidation.createBannerZodSchema),
  BannerController.createBanner
);

router.get(
  "/",
  BannerController.getAllBanners
);

router.get(
  "/:id",
  BannerController.getBannerById
);

router.patch(
  "/:id",
  auth(Role.ADMIN),
  validateRequest(BannerValidation.updateBannerZodSchema),
  BannerController.updateBanner
);

router.delete(
  "/:id",
  auth(Role.ADMIN),
  BannerController.deleteBanner
);

export const BannerRouter = router;
