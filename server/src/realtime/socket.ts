import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export let io: Server | null = null;

type AuthedSocket = Parameters<NonNullable<Server["on"]>>[1] extends (arg: infer T) => any
  ? T & { data: { userId?: string; displayName?: string; username?: string } }
  : never;

export function initSocket(httpServer: any) {
  io = new Server(httpServer, {
    cors: { origin: process.env.CORS_ORIGIN || "*" }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error("Missing token"));

      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, deletedAt: true }
      });
      if (!user || user.deletedAt) return next(new Error("Account deleted"));

      socket.data.userId = user.id;
      next();
    } catch (e) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket: AuthedSocket) => {
    const userId = socket.data.userId!;
    if (!userId) {
      socket.disconnect(true);
      return;
    }

    const me = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, displayName: true, username: true }
    });

    socket.data.displayName = me?.displayName;
    socket.data.username = me?.username;

    const convs = await prisma.conversation.findMany({
      where: { users: { some: { id: userId } } },
      select: { id: true }
    });
    convs.forEach(c => socket.join(`conv:${c.id}`));

    socket.on("typing", (data: { conversationId: string; isTyping: boolean }) => {
      const name = socket.data.displayName || socket.data.username || "Someone";
      io?.to(`conv:${data.conversationId}`).emit("typing", {
        userId,
        displayName: name,
        isTyping: data.isTyping
      });
    });
  });

  return io;
}
