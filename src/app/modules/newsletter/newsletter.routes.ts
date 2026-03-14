import express from "express";
import validateRequest from "../../middlewares/validateRequest.js";
import { NewsletterController } from "./newsletter.controller.js";
import { NewsletterValidation } from "./newsletter.validation.js";
import auth from "src/app/middlewares/auth.js";
import { Role } from "@prisma/client";

const router = express.Router();

router.post(
  "/",
  validateRequest(NewsletterValidation.subscribe),
  NewsletterController.subscribe,
);

router.get(
  "/",
  auth(Role.ADMIN),
  NewsletterController.getAllNewsletters,
);

export const NewsletterRouter = router;
