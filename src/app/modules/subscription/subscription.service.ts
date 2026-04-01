import httpStatus from "http-status";
import {
  ISubscriptionPackageCreatePayload,
  ISubscriptionPackageUpdatePayload,
  IUserSubscribePayload,
} from "./subscription.interface.js";
import ApiError from "../../../errors/ApiError.js";
import { config } from "../../../config/index.js";
import { prisma } from "helpers.ts/prisma.js";
import { stripe } from "helpers.ts/stripeHelpers.js";

/* ================= CREATE PACKAGE (Admin) ================= */
const createPackage = async (payload: ISubscriptionPackageCreatePayload) => {
  return await prisma.subscriptionPackage.create({
    data: {
      ...payload,
      // Ensure price is handled correctly if using Prisma.Decimal
      price: payload.price, 
    },
  });
};

/* ================= GET ALL PACKAGES ================= */
const getAllPackages = async () => {
  return await prisma.subscriptionPackage.findMany({
    orderBy: { price: "asc" },
  });
};

/* ================= GET PACKAGE BY ID ================= */
const getPackageById = async (id: string) => {
  const pkg = await prisma.subscriptionPackage.findUnique({
    where: { id },
  });
  if (!pkg) {
    throw new ApiError(httpStatus.NOT_FOUND, "Subscription package not found");
  }
  return pkg;
};

/* ================= UPDATE PACKAGE (Admin) ================= */
const updatePackage = async (id: string, payload: ISubscriptionPackageUpdatePayload) => {
  await getPackageById(id); // Check existence first
  return await prisma.subscriptionPackage.update({
    where: { id },
    data: payload,
  });
};

/* ================= DELETE PACKAGE (Admin) ================= */
const deletePackage = async (id: string) => {
  await getPackageById(id); // Check existence first
  return await prisma.subscriptionPackage.delete({
    where: { id },
  });
};

/* ================= CREATE SUBSCRIPTION SESSION ================= */
/**
 * Generates the Stripe Checkout URL. 
 * Database is NOT updated here; it waits for the Webhook.
 */
const createSubscriptionSession = async (
  userId: string,
  payload: IUserSubscribePayload,
) => {
  const { packageId } = payload; // operatorId is no longer needed here

  // 1. Fetch package from DB
  const pkg = await getPackageById(packageId);

  if (!pkg.stripePriceId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This package does not have a valid Stripe Price ID configured."
    );
  }

  console.log(`[Stripe] Creating Platform-owned session for package: ${pkg.name}`);

  // 2. Create the Checkout Session (Money stays on Platform)
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: pkg.stripePriceId, 
        quantity: 1,
      },
    ],
    // Remove 'subscription_data.transfer_data' so money stays with you
    subscription_data: {
      metadata: { userId, packageId: pkg.id }, 
    },
    metadata: { userId, packageId: pkg.id }, 
    success_url: `${config.frontend_url}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontend_url}/subscription-cancelled`,
  });

  return session.url;
};
/* ================= GET MY SUBSCRIPTION ================= */
const getMySubscription = async (userId: string) => {
  return await prisma.userSubscription.findFirst({
    where: { userId, isActive: true },
    include: { package: true },
  });
};

/* ================= GET ALL SUBSCRIPTIONS (Admin) ================= */
const getAllSubscriptions = async () => {
  return await prisma.userSubscription.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      package: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const SubscriptionService = {
  createPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  createSubscriptionSession,
  getMySubscription,
  getAllSubscriptions,
};