import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { verifyToken } from "./config/jwt";
import type { JwtUserPayload } from "./types/auth";

let io: Server | null = null;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers.authorization || "").split(" ")[1];
    if (!token) return next(new Error("Unauthorized"));
    try {
      const payload = verifyToken(token) as JwtUserPayload;
      socket.data.userId = payload.sub;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string | undefined;
    if (userId) {
      socket.join(`user:${userId}`);
    }
    socket.on("disconnect", () => {});
  });

  return io;
};

export const getIo = () => io;
