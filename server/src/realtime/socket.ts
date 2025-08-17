import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export let io: Server | null = null;

export function initSocket(httpServer: any) {
  io = new Server(httpServer, {
    cors: { origin: process.env.CORS_ORIGIN || "*" }
  });

  // Authenticate socket with the same JWT (sent via handshake auth)
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error("Missing token"));
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      (socket as any).userId = payload.userId;
      next();
    } catch (e) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = (socket as any).userId as string;

    // Join all conversation rooms the user participates in
    const convs = await prisma.conversation.findMany({
      where: { users: { some: { id: userId } } },
      select: { id: true }
    });
    convs.forEach(c => socket.join(`conv:${c.id}`));

    // Optional: typing indicator
    socket.on("typing", (data: { conversationId: string; isTyping: boolean }) => {
      socket.to(`conv:${data.conversationId}`).emit("typing", { userId, isTyping: data.isTyping });
    });
  });

  return io;
}
