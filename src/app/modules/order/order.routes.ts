import express from "express";
import { Role } from "@prisma/client";
import { OrderController } from "./order.controller.js";
import { OrderValidation } from "./order.validation.js";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";

const router = express.Router();

router.post(
  "/",
  auth(Role.USER),
  validateRequest(OrderValidation.createOrderSchema),
  OrderController.createOrder
);

router.get("/", auth(Role.USER), OrderController.getMyOrders);

router.get("/operator", auth(Role.OPERATOR), OrderController.getOperatorOrders);

router.get("/all", auth(Role.ADMIN), OrderController.getAllOrders);

router.get("/:id", auth(Role.USER, Role.OPERATOR, Role.ADMIN), OrderController.getOrderById);

router.patch(
  "/:id/status",
  auth(Role.OPERATOR, Role.ADMIN),
  validateRequest(OrderValidation.updateOrderStatusSchema),
  OrderController.updateOrderStatus
);

router.patch("/:id/cancel", auth(Role.USER), OrderController.cancelOrder);

export const OrderRouter = router;
