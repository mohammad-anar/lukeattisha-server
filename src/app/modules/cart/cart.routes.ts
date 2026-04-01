import express from "express";
import { Role } from "@prisma/client";
import { CartController } from "./cart.controller.js";
import { CartValidation } from "./cart.validation.js";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";

const router = express.Router();

router.get("/my-cart", auth(Role.USER), CartController.getMyCart);

router.post(
  "/add",
  auth(Role.USER),
  validateRequest(CartValidation.addToCartZodSchema),
  CartController.addToCart
);

router.patch(
  "/update/:cartItemId",
  auth(Role.USER),
  validateRequest(CartValidation.updateCartItemZodSchema),
  CartController.updateCartItem
);

router.delete(
  "/remove/:cartItemId",
  auth(Role.USER),
  CartController.removeFromCart
);

router.delete(
  "/clear",
  auth(Role.USER),
  CartController.clearCart
);

export const CartRoutes = router;
