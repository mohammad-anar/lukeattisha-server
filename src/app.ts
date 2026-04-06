import cors from "cors";
import express, { Application, Request, Response } from "express";
import router from "./app/routes/index.js";
import globalErrorHandler from "./app/middlewares/globalErrorHandler.js";
import notFound from "./app/middlewares/notFound.js";
import { PaymentController } from "./app/modules/payment/payment.controller.js";

const app: Application = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.static("uploads"));

// DIAGNOSTIC: Log every single request to see what's happening
app.use((req, res, next) => {
  if (req.path.includes("webhook")) {
    console.log(`[GLOBAL LOG] Webhook access: ${req.method} ${req.path}`);
  }
  next();
});

// ---------- 1. WEBHOOK (Must stay BEFORE express.json()) ----------
// Register multiple paths to be safe (Singular, Plural, and Root)
const webhookPaths = [
  "/api/v1/payment/webhook",
  "/api/v1/payments/webhook",
  "/webhook"
];

app.post(
  webhookPaths,
  express.raw({ type: "*/*" }),
  (req, res, next) => {
    console.log(`[STRIPE WEBHOOK ATTEMPT] Received request on path: ${req.path}`);
    next();
  },
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