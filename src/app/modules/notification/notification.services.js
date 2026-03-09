import { prisma } from "src/helpers.ts/prisma.js";
/* ---------- CREATE NOTIFICATION ---------- */
const createNotification = async (payload) => {
    return prisma.notification.create({
        data: payload,
    });
};
/* ---------- GET ALL NOTIFICATIONS ---------- */
const getAllNotifications = async () => {
    return prisma.notification.findMany({
        orderBy: { createdAt: "desc" },
    });
};
/* ---------- GET NOTIFICATIONS BY USER ID ---------- */
const getNotificationsByUserId = async (userId) => {
    return prisma.notification.findMany({
        where: {
            receiverUserId: userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};
/* ---------- GET NOTIFICATIONS BY WORKSHOP ID ---------- */
const getNotificationsByWorkshopId = async (workshopId) => {
    return prisma.notification.findMany({
        where: {
            receiverWorkshopId: workshopId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};
/* ---------- GET NOTIFICATIONS BY BOOKING ID ---------- */
const getNotificationsByBookingId = async (bookingId) => {
    return prisma.notification.findMany({
        where: { bookingId },
        orderBy: { createdAt: "desc" },
    });
};
/* ---------- GET NOTIFICATION BY ID ---------- */
const getNotificationById = async (id) => {
    return prisma.notification.findUnique({
        where: { id },
    });
};
/* ---------- MARK AS READ ---------- */
const markAsRead = async (id) => {
    return prisma.notification.update({
        where: { id },
        data: { isRead: true },
    });
};
/* ---------- MARK MULTIPLE AS READ ---------- */
const markNotificationsAsRead = async (notificationIds) => {
    const result = await prisma.notification.updateMany({
        where: {
            id: { in: notificationIds },
        },
        data: {
            isRead: true,
        },
    });
    return result;
};
/* ---------- DELETE NOTIFICATION ---------- */
const deleteNotification = async (id) => {
    return prisma.notification.delete({
        where: { id },
    });
};
export const NotificationService = {
    createNotification,
    getAllNotifications,
    getNotificationsByUserId,
    getNotificationsByWorkshopId,
    getNotificationsByBookingId,
    getNotificationById,
    markAsRead,
    markNotificationsAsRead,
    deleteNotification,
};
