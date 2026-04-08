import cors from "cors";
import express, { Application, Request, Response } from "express";
import router from "./app/routes/index.js";
import globalErrorHandler from "./app/middlewares/globalErrorHandler.js";
import notFound from "./app/middlewares/notFound.js";
import { PaymentController } from "./app/modules/payment/payment.controller.js";

const app: Application = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.static("uploads"));

// ---------- 1. WEBHOOK (Must stay BEFORE express.json()) ----------
const webhookPaths = [
  "/api/v1/payment/webhook",
  "/api/v1/payments/webhook",
  "/webhook"
];

app.post(
  webhookPaths,
  express.raw({ type: "*/*" }),
  PaymentController.handleWebhook
);

// ---------- 2. PARSERS (Must stay AFTER webhook) ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- 3. ROUTES ----------
app.use("/api/v1", router);

app.get("/", (req, res) => res.send({ status: "Server Running" }));
app.use(globalErrorHandler);
app.use(notFound);

export default app;