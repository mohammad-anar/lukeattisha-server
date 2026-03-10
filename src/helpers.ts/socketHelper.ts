import colors from "colors";
import { Server, Socket } from "socket.io";
import { prisma } from "./prisma.js";
import { Prisma } from "@prisma/client";
import { ChatService } from "../app/modules/chat/chat.service.js";

type NotificationData = {
  userId?: string;
  workshopIds?: string[]; // now an array
  triggeredById?: string;
  bookingId?: string;
  jobId?: string;
  roomId?: string;
  title: string;
  body: string;
  eventType: string; // added eventType
};

let io: Server | null = null;

// Store multiple sockets per user/workshop
const socketMap: Map<string, Set<string>> = new Map();

export const initSocket = (server: any) => {
  io = new Server(server, {
    pingTimeout: 60000,
    cors: { origin: "*" },
  });

  io.on("connection", (socket: Socket) => {
    console.log(colors.green("A user connected"));

    socket.on("register", (id: string) => {
      if (!socketMap.has(id)) socketMap.set(id, new Set());
      socketMap.get(id)!.add(socket.id);
      console.log(colors.blue(`Registered socket ${socket.id} for ID ${id}`));
    });

    socket.on("disconnect", () => {
      console.log(colors.red(`Socket disconnected: ${socket.id}`));
      for (const [id, sockets] of socketMap.entries()) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          if (sockets.size === 0) socketMap.delete(id);
        }
      }
    });

    // Chat Events
    socket.on("join_room", (roomId: string) => {
      socket.join(roomId);
      console.log(colors.blue(`Socket ${socket.id} joined room ${roomId}`));
    });

    socket.on("leave_room", (roomId: string) => {
      socket.leave(roomId);
      console.log(colors.gray(`Socket ${socket.id} left room ${roomId}`));
    });

    socket.on("send_message", async (data: { roomId: string, senderId: string, content: string, type?:any }) => {
      try {
        const message = await ChatService.saveMessage(data);
        
        // Broadcast to everyone in the room
        io!.to(data.roomId).emit("receive_message", message);
        
        // Broadcast notification to users to update their room lists if they are online
        // Need to know the participants of the room
        const room = await ChatService.getRoomById(data.roomId);
        if (room) {
          const receiverId = room.userId === data.senderId ? room.workshopId : room.userId;
          const receiverSockets = getSocketIds(receiverId);
          
          receiverSockets.forEach((socketId) => {
            io!.to(socketId).emit("new_message_notification", {
              roomId: room.id,
              message,
            });
          });
        }

      } catch (error) {
        console.error("Error saving message", error);
      }
    });

    socket.on("typing", (data: { roomId: string, senderId: string, isTyping: boolean }) => {
      socket.to(data.roomId).emit("user_typing", data);
    });

  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};

export const getSocketIds = (id: string) => {
  return Array.from(socketMap.get(id) || []);
};

// ---------------- Fixed createAndEmitNotification ----------------
export const createAndEmitNotification = async (data: NotificationData) => {
  // Map our custom type to Prisma's NotificationCreateInput
  const prismaData: Prisma.NotificationCreateInput = {
    title: data.title,
    body: data.body,
    jobId: data.jobId,
    triggeredById: data.triggeredById,
    eventType: data.eventType, // mapped eventType
  };

  // 1️⃣ Create notification in database
  const notification = await prisma.notification.create({
    data: prismaData,
  });

  const io = getIO();

  // 2️⃣ Emit to all workshop sockets
  if (data.workshopIds?.length) {
    data.workshopIds.forEach((workshopId) => {
      const socketIds = getSocketIds(workshopId);
      socketIds.forEach((socketId) => {
        io.to(socketId).emit("notification", notification);
      });
    });
  }

  // 3️⃣ Emit to user socket
  if (data.userId) {
    const socketIds = getSocketIds(data.userId);
    socketIds.forEach((socketId) => {
      io.to(socketId).emit("notification", notification);
    });
  }

  return notification;
};
