import express from "express";
import { JobOfferController } from "./jobOffer.controller.js";
import auth from "src/app/middlewares/auth.js";
import { Role } from "@prisma/client";

const router = express.Router();

router.post("/", auth(Role.WORKSHOP), JobOfferController.createJobOffer);

export const JobOfferRouter = router;
