import { prisma } from "src/helpers.ts/prisma.js";
/* ---------- CREATE ---------- */
const createChatNotification = async (payload) => {
    return prisma.chatNotification.create({
        data: payload,
    });
};
/* ---------- GET ALL ---------- */
const getAllChatNotifications = async () => {
    return prisma.chatNotification.findMany({
        orderBy: { createdAt: "desc" },
    });
};
/* ---------- GET BY CHAT ROOM ---------- */
const getChatNotificationsByRoomId = async (chatRoomId) => {
    return prisma.chatNotification.findMany({
        where: { chatRoomId },
        orderBy: { createdAt: "desc" },
    });
};
/* ---------- MARK AS READ ---------- */
const markChatNotificationAsRead = async (id) => {
    return prisma.chatNotification.update({
        where: { id },
        data: { isRead: true },
    });
};
/* ---------- DELETE ---------- */
const deleteChatNotification = async (id) => {
    return prisma.chatNotification.delete({
        where: { id },
    });
};
export const ChatNotificationService = {
    createChatNotification,
    getAllChatNotifications,
    getChatNotificationsByRoomId,
    markChatNotificationAsRead,
    deleteChatNotification,
};
