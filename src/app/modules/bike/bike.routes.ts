import express from "express";
import { BikeController } from "./bike.controller.js";
import auth from "src/app/middlewares/auth.js";
import { Role } from "@prisma/client";

const router = express.Router();

router.post("/", auth(Role.USER), BikeController.createBike);
router.get("/:id", auth(Role.USER), BikeController.getBikeById);
router.patch("/:id", auth(Role.USER), BikeController.updateBike);
router.delete("/:id", auth(Role.USER), BikeController.deleteBike);

export const BikeRouter = router;
