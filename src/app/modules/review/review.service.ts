
import httpStatus from "http-status";
import { IReviewCreatePayload, IReviewReplyPayload } from "./review.interface.js";
import { prisma } from "helpers.ts/prisma.js";
import ApiError from "errors/ApiError.js";

/* ================= CREATE REVIEW ================= */
const createReview = async (userId: string, payload: IReviewCreatePayload) => {
  // Ensure order belongs to user
  const order = await prisma.order.findUnique({ where: { id: payload.orderId } });
  if (!order) throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  if (order.userId !== userId) throw new ApiError(httpStatus.FORBIDDEN, "Forbidden");
  if (order.status !== "DELIVERED") throw new ApiError(httpStatus.BAD_REQUEST, "Can only review delivered orders");

  // Prevent duplicate review
  const existing = await prisma.serviceReview.findFirst({
    where: { userId, orderId: payload.orderId, serviceId: payload.serviceId },
  });
  if (existing) throw new ApiError(httpStatus.CONFLICT, "You have already reviewed this service for this order");

  return await prisma.serviceReview.create({
    data: { ...payload, userId },
  });
};

/* ================= GET REVIEWS BY SERVICE ================= */
const getReviewsByService = async (serviceId: string) => {
  return await prisma.serviceReview.findMany({
    where: { serviceId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
};

/* ================= GET MY REVIEWS ================= */
const getMyReviews = async (userId: string) => {
  return await prisma.serviceReview.findMany({
    where: { userId },
    include: { service: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
};

/* ================= OPERATOR REPLY ================= */
const replyToReview = async (userId: string, reviewId: string, payload: IReviewReplyPayload) => {
  const profile = await prisma.operatorProfile.findUnique({ where: { userId } });
  if (!profile) throw new ApiError(httpStatus.NOT_FOUND, "Operator profile not found");

  const review = await prisma.serviceReview.findUnique({
    where: { id: reviewId },
    include: { service: true },
  });
  if (!review) throw new ApiError(httpStatus.NOT_FOUND, "Review not found");
  if (review.service.operatorId !== profile.id) throw new ApiError(httpStatus.FORBIDDEN, "Forbidden");

  return await prisma.serviceReview.update({
    where: { id: reviewId },
    data: { operatorReply: payload.operatorReply },
  });
};

/* ================= DELETE REVIEW ================= */
const deleteReview = async (userId: string, reviewId: string) => {
  const review = await prisma.serviceReview.findUnique({ where: { id: reviewId } });
  if (!review) throw new ApiError(httpStatus.NOT_FOUND, "Review not found");
  if (review.userId !== userId) throw new ApiError(httpStatus.FORBIDDEN, "Forbidden");
  return await prisma.serviceReview.delete({ where: { id: reviewId } });
};

/* ================= GET ALL REVIEWS (admin) ================= */
const getAllReviews = async () => {
  return await prisma.serviceReview.findMany({
    include: {
      user: { select: { id: true, name: true } },
      service: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const ReviewService = {
  createReview,
  getReviewsByService,
  getMyReviews,
  replyToReview,
  deleteReview,
  getAllReviews,
};
