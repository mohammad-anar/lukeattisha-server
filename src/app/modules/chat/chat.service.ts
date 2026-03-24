
import { prisma } from "helpers.ts/prisma.js";
import ApiError from "../../../errors/ApiError.js";


/* ================= CREATE OR GET ROOM ================= */
const createOrGetRoom = async (userId1: string, userId2: string) => {
  // Try to find if a room exists with BOTH participants
  const existingRooms = await prisma.chatRoom.findMany({
    where: {
      AND: [
        { participants: { some: { userId: userId1 } } },
        { participants: { some: { userId: userId2 } } },
      ],
    },
    include: {
      participants: true,
    },
  });

  // Since a room might have more people, find the exact 2-person room
  const directRoom = existingRooms.find((r: any) => r.participants.length === 2);

  if (directRoom) {
    return directRoom;
  }

  // Otherwise, create a new room
  return await prisma.chatRoom.create({
    data: {
      participants: {
        create: [{ userId: userId1 }, { userId: userId2 }],
      },
    },
    include: {
      participants: true,
    },
  });
};

/* ================= GET MY ROOMS ================= */
const getMyRooms = async (userId: string) => {
  return await prisma.chatRoom.findMany({
    where: {
      participants: {
        some: { userId },
      },
    },
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, avatar: true, role: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1, // Get the latest message for preview
      },
    },
    orderBy: { updatedAt: "desc" },
  });
};

/* ================= GET ROOM MESSAGES ================= */
const getMessages = async (roomId: string, userId: string) => {
  // Validate if user is in room
  const participant = await prisma.chatParticipant.findUnique({
    where: { roomId_userId: { roomId, userId } },
  });

  if (!participant) {
    throw new ApiError(403, "Not authorized to access messages in this room");
  }

  return await prisma.chatMessage.findMany({
    where: { roomId, isDeleted: false },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "asc" },
  });
};

/* ================= SEND MESSAGE ================= */
const sendMessage = async (roomId: string, senderId: string, content: string) => {
  const participant = await prisma.chatParticipant.findUnique({
    where: { roomId_userId: { roomId, userId: senderId } },
  });

  if (!participant) {
    throw new ApiError(403, "Not authorized to send messages to this room");
  }

  const message = await prisma.chatMessage.create({
    data: { roomId, senderId, content },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
    },
  });

  // Update room's updatedAt so it bubbles to top of list
  await prisma.chatRoom.update({
    where: { id: roomId },
    data: { updatedAt: new Date() },
  });

  return message;
};

/* ================= EDIT MESSAGE ================= */
const editMessage = async (messageId: string, userId: string, content: string) => {
  const msg = await prisma.chatMessage.findUnique({ where: { id: messageId } });
  if (!msg || msg.isDeleted) throw new ApiError(404, "Message not found");
  if (msg.senderId !== userId) throw new ApiError(403, "Cannot edit another user's message");

  return await prisma.chatMessage.update({
    where: { id: messageId },
    data: { content },
  });
};

/* ================= DELETE MESSAGE ================= */
const deleteMessage = async (messageId: string, userId: string) => {
  const msg = await prisma.chatMessage.findUnique({ where: { id: messageId } });
  if (!msg || msg.isDeleted) throw new ApiError(404, "Message not found");
  if (msg.senderId !== userId) throw new ApiError(403, "Cannot delete another user's message");

  return await prisma.chatMessage.update({
    where: { id: messageId },
    data: { isDeleted: true, content: "[Message Deleted]" },
  });
};

export const ChatService = {
  createOrGetRoom,
  getMyRooms,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
};
