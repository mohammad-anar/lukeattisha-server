import express from "express";
import { WorkshopController } from "./workshop.controller.js";
import auth from "src/app/middlewares/auth.js";
import { Role } from "@prisma/client";
import validateRequest from "src/app/middlewares/validateRequest.js";
import { createWorkshopSchema } from "./workshop.validation.js";

const router = express.Router();

router.get("/", auth(Role.ADMIN), WorkshopController.getAllWorkshops);
router.post(
  "/register",
  validateRequest(createWorkshopSchema),
  WorkshopController.createWorkshop,
);

export const WorkshopRouter = router;
