
import httpStatus from "http-status";
import { OrderStatus, PaymentMethodType, PaymentStatus } from "@prisma/client";
import { prisma } from "helpers.ts/prisma.js";
import ApiError from "errors/ApiError.js";

/* ================= CREATE PAYMENT ================= */
const createPayment = async (orderId: string, method: PaymentMethodType, transactionId?: string) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new ApiError(httpStatus.NOT_FOUND, "Order not found");

  const payment = await prisma.payment.create({
    data: {
      orderId,
      amount: order.total,
      method,
      status: PaymentStatus.PAID,
      transactionId,
    },
  });

  // Update order payment status
  await prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.ACCEPTED },
  });

  return payment;
};

/* ================= GET PAYMENTS BY ORDER ================= */
const getPaymentsByOrder = async (orderId: string) => {
  return await prisma.payment.findMany({
    where: { orderId },
    orderBy: { createdAt: "desc" },
  });
};

/* ================= GET MY PAYMENT CARDS ================= */
const getMyPaymentCards = async (userId: string) => {
  return await prisma.paymentCard.findMany({
    where: { userId },
    orderBy: { isDefault: "desc" },
  });
};

/* ================= ADD PAYMENT CARD ================= */
const addPaymentCard = async (userId: string, payload: { stripeMethodId: string; last4: string; brand: string }) => {
  const count = await prisma.paymentCard.count({ where: { userId } });
  return await prisma.paymentCard.create({
    data: { ...payload, userId, isDefault: count === 0 },
  });
};

/* ================= SET DEFAULT CARD ================= */
const setDefaultCard = async (userId: string, cardId: string) => {
  await prisma.paymentCard.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
  return await prisma.paymentCard.update({ where: { id: cardId }, data: { isDefault: true } });
};

/* ================= DELETE PAYMENT CARD ================= */
const deletePaymentCard = async (userId: string, cardId: string) => {
  const card = await prisma.paymentCard.findUnique({ where: { id: cardId } });
  if (!card) throw new ApiError(httpStatus.NOT_FOUND, "Card not found");
  if (card.userId !== userId) throw new ApiError(httpStatus.FORBIDDEN, "Forbidden");
  return await prisma.paymentCard.delete({ where: { id: cardId } });
};

/* ================= GET ALL PAYMENTS (admin) ================= */
const getAllPayments = async () => {
  return await prisma.payment.findMany({
    include: { order: { select: { id: true, userId: true, operatorIds: true } } },
    orderBy: { createdAt: "desc" },
  });
};

export const PaymentService = {
  createPayment,
  getPaymentsByOrder,
  getMyPaymentCards,
  addPaymentCard,
  setDefaultCard,
  deletePaymentCard,
  getAllPayments,
};
