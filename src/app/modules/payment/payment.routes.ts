import express from "express";
import auth from "src/app/middlewares/auth.js";
import validateRequest from "src/app/middlewares/validateRequest.js";
import { Role } from "@prisma/client";
import { PaymentController } from "./payment.controller.js";
import { PaymentValidation } from "./payment.validation.js";

const router = express.Router();

router.post(
  "/",
  auth(Role.USER, Role.ADMIN),
  validateRequest(PaymentValidation.createPaymentSchema),
  PaymentController.createPayment
);

router.get("/all", auth(Role.ADMIN), PaymentController.getAllPayments);

router.get("/order/:orderId", auth(Role.USER, Role.OPERATOR, Role.ADMIN), PaymentController.getPaymentsByOrder);

router.get("/cards", auth(Role.USER), PaymentController.getMyPaymentCards);

router.post(
  "/cards",
  auth(Role.USER),
  validateRequest(PaymentValidation.addCardSchema),
  PaymentController.addPaymentCard
);

router.patch("/cards/:id/default", auth(Role.USER), PaymentController.setDefaultCard);

router.delete("/cards/:id", auth(Role.USER), PaymentController.deletePaymentCard);

export const PaymentRouter = router;
