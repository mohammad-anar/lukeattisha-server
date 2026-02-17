import colors from "colors";
import { Server, Socket } from "socket.io";

let io: Server | null = null;

export const initSocket = (server: any) => {
  io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(colors.green("A user connected"));

    socket.on("disconnect", () => {
      console.log(colors.red("A user disconnected"));
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
