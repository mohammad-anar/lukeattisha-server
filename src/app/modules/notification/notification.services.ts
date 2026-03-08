import { prisma } from "src/helpers.ts/prisma.js";

/* ---------- CREATE NOTIFICATION ---------- */

const createNotification = async (payload: any) => {
  const result = await prisma.notification.create({
    data: payload,
  });

  return result;
};

/* ---------- GET ALL NOTIFICATIONS ---------- */

const getAllNotifications = async () => {
  const result = await prisma.notification.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      booking: true,
      job: true,
      room: true,
      workshop: true,
    },
  });

  return result;
};

/* ---------- GET NOTIFICATION BY ID ---------- */

const getNotificationById = async (id: string) => {
  const result = await prisma.notification.findUnique({
    where: { id },
    include: {
      booking: true,
      job: true,
      room: true,
      workshop: true,
    },
  });

  return result;
};

/* ---------- MARK AS READ ---------- */

const markAsRead = async (id: string) => {
  const result = await prisma.notification.update({
    where: { id },
    data: {
      isRead: true,
    },
  });

  return result;
};

/* ---------- DELETE NOTIFICATION ---------- */

const deleteNotification = async (id: string) => {
  const result = await prisma.notification.delete({
    where: { id },
  });

  return result;
};

export const NotificationService = {
  createNotification,
  getAllNotifications,
  getNotificationById,
  markAsRead,
  deleteNotification,
};
