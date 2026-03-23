import { prisma } from "src/helpers.ts/prisma.js";

/* ================= GET MY NOTIFICATIONS ================= */
const getMyNotifications = async (userId: string) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

/* ================= MARK AS SENT ================= */
const markAsSent = async (id: string) => {
  return await prisma.notification.update({
    where: { id },
    data: { isSent: true },
  });
};

/* ================= DELETE NOTIFICATION ================= */
const deleteNotification = async (id: string) => {
  return await prisma.notification.delete({ where: { id } });
};

/* ================= GET ALL NOTIFICATIONS (admin) ================= */
const getAllNotifications = async () => {
  return await prisma.notification.findMany({
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
};

export const NotificationService = {
  getMyNotifications,
  markAsSent,
  deleteNotification,
  getAllNotifications,
};
