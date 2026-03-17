import express from "express";
import auth from "src/app/middlewares/auth.js";
import validateRequest from "src/app/middlewares/validateRequest.js";
import { FavoriteController } from "./favorite.controller.js";
import { FavoriteValidation } from "./favorite.validation.js";
import { Role } from "@prisma/client";

const router = express.Router();

router.post(
  "/",
  auth(Role.USER),
  validateRequest(FavoriteValidation.createFavoriteZodSchema),
  FavoriteController.addFavorite
);

router.get("/my-favorites", auth(Role.USER), FavoriteController.getMyFavorites);

router.delete("/:serviceId", auth(Role.USER), FavoriteController.removeFavorite);

export const FavoriteRouter = router;
