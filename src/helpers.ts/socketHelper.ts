import colors from "colors";
import { config } from "config/index.js";
import { Server, Socket } from "socket.io";
import { ChatService } from "../app/modules/chat/chat.service.js";

let io: Server | null = null;

const socketMap: Map<string, Set<string>> = new Map();

export const initSocket = (server: any) => {
  io = new Server(server, {
    pingTimeout: 60000,
    cors: { origin: config.cors_origin },
  });

  io.on("connection", (socket: Socket) => {
    console.log(colors.green("A user connected"));

    socket.on("register", (id: string) => {
      if (!socketMap.has(id)) socketMap.set(id, new Set());
      socketMap.get(id)!.add(socket.id);
      
      // Also join a personal room for this user
      socket.join(`user:${id}`);
      console.log(colors.blue(`Registered socket ${socket.id} for ID ${id}`));
    });

    // Join a standard DB Room
    socket.on("join-room", (roomId: string) => {
      // Conventionally join 'room:{id}'
      socket.join(`room:${roomId}`);
      console.log(colors.cyan(`Socket ${socket.id} joined room: room:${roomId}`));
    });

    // Create / Send Message directly via socket instead of REST API (saves to DB)
    socket.on("send-message", async (data: { roomId: string, senderId: string, content: string }) => {
      try {
        if (data.roomId && data.senderId && data.content) {
          // Persist in DB
          const message = await ChatService.sendMessage(data.roomId, data.senderId, data.content);
          // Broadcast to everyone in the room
          io?.to(`room:${data.roomId}`).emit("new-message", message);
          console.log(colors.magenta(`Message sent in room: ${data.roomId} by ${data.senderId}`));
        }
      } catch (err) {
        console.error("Error sending socket message", err);
      }
    });

    socket.on("leave-room", (roomId: string) => {
      socket.leave(`room:${roomId}`);
      console.log(colors.yellow(`Socket ${socket.id} left room: room:${roomId}`));
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

/**
 * Emit an event to a specific room.
 * e.g. emitToRoom("order:123", "order_status_update", { status: "OUT_FOR_DELIVERY" })
 */
export const emitToRoom = (room: string, event: string, payload: any) => {
  if (io) {
    io.to(room).emit(event, payload);
  }
};

/**
 * Emit an event to a specific user globally over their personal room.
 */
export const emitToUser = (userId: string, event: string, payload: any) => {
  if (io) {
    // Falls back to array of socket ids if personal room is somehow missed, 
    // but emitting to "user:userId" is the preferred approach
    io.to(`user:${userId}`).emit(event, payload);
  }
};
