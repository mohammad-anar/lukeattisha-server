
import httpStatus from "http-status";
import {
  ISubscriptionPackageCreatePayload,
  ISubscriptionPackageUpdatePayload,
  IUserSubscribePayload,
} from "./subscription.interface.js";
import { prisma } from "helpers.ts/prisma.js";
import ApiError from "errors/ApiError.js";

/* ================= CREATE PACKAGE (admin) ================= */
const createPackage = async (payload: ISubscriptionPackageCreatePayload) => {
  return await prisma.subscriptionPackage.create({ data: payload });
};

/* ================= GET ALL PACKAGES ================= */
const getAllPackages = async () => {
  return await prisma.subscriptionPackage.findMany({ orderBy: { price: "asc" } });
};

/* ================= GET PACKAGE BY ID ================= */
const getPackageById = async (id: string) => {
  const pkg = await prisma.subscriptionPackage.findUnique({ where: { id } });
  if (!pkg) throw new ApiError(httpStatus.NOT_FOUND, "Package not found");
  return pkg;
};

/* ================= UPDATE PACKAGE (admin) ================= */
const updatePackage = async (id: string, payload: ISubscriptionPackageUpdatePayload) => {
  await getPackageById(id);
  return await prisma.subscriptionPackage.update({ where: { id }, data: payload });
};

/* ================= DELETE PACKAGE (admin) ================= */
const deletePackage = async (id: string) => {
  await getPackageById(id);
  return await prisma.subscriptionPackage.delete({ where: { id } });
};

/* ================= SUBSCRIBE ================= */
const subscribe = async (userId: string, payload: IUserSubscribePayload) => {
  const pkg = await getPackageById(payload.packageId);

  // Deactivate any existing active subscription
  await prisma.userSubscription.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false },
  });

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + pkg.durationDays);

  return await prisma.$transaction(async (tx) => {
    const userSub = await tx.userSubscription.create({
      data: {
        userId,
        packageId: pkg.id,
        startDate,
        endDate,
        isActive: true,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: { isSubscribed: true } as any,
    });

    return userSub;
  });
};

/* ================= GET MY SUBSCRIPTION ================= */
const getMySubscription = async (userId: string) => {
  return await prisma.userSubscription.findFirst({
    where: { userId, isActive: true },
    include: { package: true },
  });
};

/* ================= GET ALL SUBSCRIPTIONS (admin) ================= */
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
  subscribe,
  getMySubscription,
  getAllSubscriptions,
};
