import cors from "cors";
import express, { Application, Request, Response } from "express";
import router from "./app/routes/index.js";
import globalErrorHandler from "./app/middlewares/globalErrorHandler.js";
import notFound from "./app/middlewares/notFound.js";
import { getIO } from "./helpers.ts/socketHelper.js";

import Stripe from "stripe";
import { prisma } from "./helpers.ts/prisma.js";
import { stripe } from "./helpers.ts/stripeHelpers.js";
import { config } from "config/index.js";

const endpointSecret = config.stripe.stripe_webhook_secret as string;

const app: Application = express();

// ---------- CORS ----------
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// ---------- Static files ----------
app.use(express.static("uploads"));

// ---------- Webhook route must come BEFORE express.json() ----------
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (userId) {
        await prisma.userSubscription.create({
          data: {
            userId,
            subscriptionType: "PREMIUM",
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            isActive: true,
            packageId: "",
          },
        });
      }
    }

    res.json({ received: true });
  },
);

// ---------- Parsers for all other routes ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- API Routes ----------
app.use("/api/v1", router);

// ---------- Real-time job sending ----------
app.post("/send-job", (req: Request, res: Response) => {
  const { roomId, jobId, message } = req.body;

  try {
    const io = getIO();
    io.to(roomId).emit("newJob", { jobId, message });

    res.json({ success: true, message: `Job sent to room ${roomId}` });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------- Create Stripe checkout session ----------
app.post("/subscribe-premium", async (req: Request, res: Response) => {
  const { userId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment", // or 'subscription' if you use a Stripe subscription
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Premium Subscription",
            },
            unit_amount: 999, // $9.99
          },
          quantity: 1,
        },
      ],
      payment_method_types: ["card"], // ✅ only card is allowed in TS type
      success_url: `${config.frontend_url}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.frontend_url}/subscription-cancelled`,
      metadata: { userId },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to create Stripe session" });
  }
});

// ---------- Health check ----------
app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Server is running..",
    environment: config.node_env,
    uptime: process.uptime().toFixed(2) + " sec",
    timeStamp: new Date().toISOString(),
  });
});

// ---------- Error handling ----------
app.use(globalErrorHandler);
app.use(notFound);

export default app;
