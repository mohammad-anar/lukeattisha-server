import colors from "colors";
import { config } from "config/index.js";
import { Server, Socket } from "socket.io";

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
