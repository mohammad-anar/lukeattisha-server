import express from "express";
import { FavoriteController } from "./favorite.controller.js";
import { FavoriteValidation } from "./favorite.validation.js";
import { Role } from "@prisma/client";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";

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
