import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { io } from "../realtime/socket";

const router = Router();
const prisma = new PrismaClient();

/**
 * Get the latest messages in a conversation you belong to
 * GET /messages/:conversationId?limit=50
 */
router.get("/:conversationId", requireAuth, async (req: AuthedRequest, res) => {
  const uid = req.userId!;
  const { conversationId } = req.params;
  const limit = Math.min(parseInt(String(req.query.limit ?? "30"), 10) || 30, 200);

  const cursor = req.query.cursor ? new Date(String(req.query.cursor)) : null;
  const whereBase: any = { conversationId };
  const where = cursor ? { ...whereBase, createdAt: { lt: cursor } } : whereBase;

  const conv = await prisma.conversation.findFirst({
    where: { id: conversationId, users: { some: { id: uid } } }
  });
  if (!conv) return res.status(403).json({ error: "Not in conversation" });

  const messages = await prisma.message.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { sender: { select: { id: true, username: true, displayName: true } } }
  });

  const asc = messages.slice().reverse();
  const nextCursor = asc.length ? asc[0].createdAt : null;
  res.json({ messages: asc, nextCursor });
});



/**
 * Send a message to a conversation you belong to
 * POST /messages/:conversationId  { content: string }
 */
router.post("/:conversationId", requireAuth, async (req: AuthedRequest, res) => {
  const uid = req.userId!;
  const { conversationId } = req.params;
  const { content } = req.body as { content: string };
  if (!content?.trim()) return res.status(400).json({ error: "content required" });

  const conv = await prisma.conversation.findFirst({
    where: { id: conversationId, users: { some: { id: uid } } }
  });
  if (!conv) return res.status(403).json({ error: "Not in conversation" });

  const created = await prisma.message.create({
    data: { conversationId, senderId: uid, content: content.trim() }
  });

  const msg = await prisma.message.findUnique({
    where: { id: created.id },
    include: { sender: { select: { id: true, username: true, displayName: true } } }
  });

  io?.to(`conv:${conversationId}`).emit("msg:new", { message: msg });
  res.json({ message: msg });
});

export default router;
