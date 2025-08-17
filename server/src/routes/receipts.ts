import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { io } from "../realtime/socket";

const prisma = new PrismaClient();
const router = Router();

/**
 * Mark a message as delivered to the current device/user.
 * Body: { messageId: string }
 */
router.post("/delivered", requireAuth, async (req: AuthedRequest, res) => {
  const uid = req.userId!;
  const { messageId } = req.body as { messageId: string };
  if (!messageId) return res.status(400).json({ error: "messageId required" });

  const msg = await prisma.message.findUnique({
    where: { id: messageId },
    select: { id: true, senderId: true, conversationId: true, conversation: { select: { isGroup: true, users: { select: { id: true } } } } }
  });
  if (!msg) return res.status(404).json({ error: "Message not found" });

  const isMember = msg.conversation.users.some(u => u.id === uid);
  if (!isMember) return res.status(403).json({ error: "Not in conversation" });
  if (uid === msg.senderId) return res.json({ ok: true });

  await prisma.deliveryReceipt.upsert({
    where: { messageId_toUserId: { messageId, toUserId: uid } },
    update: {},
    create: { messageId, toUserId: uid }
  });

  io?.to(`conv:${msg.conversationId}`).emit("msg:delivered", {
    messageId: msg.id,
    toUserId: uid
  });

  res.json({ ok: true });
});

/**
 * Mark latest seen message for a DM (not groups)
 * Body: { conversationId: string, messageId: string }
 */
router.post("/seen", requireAuth, async (req: AuthedRequest, res) => {
  const uid = req.userId!;
  const { conversationId, messageId } = req.body as { conversationId: string; messageId: string };
  if (!conversationId || !messageId) return res.status(400).json({ error: "conversationId and messageId required" });

  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, isGroup: true, users: { select: { id: true } } }
  });
  if (!conv) return res.status(404).json({ error: "Conversation not found" });

  const isMember = conv.users.some(u => u.id === uid);
  if (!isMember) return res.status(403).json({ error: "Not in conversation" });

  if (conv.isGroup) {
    return res.json({ ok: true });
  }

  const msg = await prisma.message.findUnique({ where: { id: messageId }, select: { id: true, conversationId: true } });
  if (!msg || msg.conversationId !== conversationId) return res.status(400).json({ error: "Invalid message" });

  await prisma.dmSeen.upsert({
    where: { conversationId_userId: { conversationId, userId: uid } },
    update: { messageId },
    create: { conversationId, userId: uid, messageId }
  });

  io?.to(`conv:${conversationId}`).emit("msg:seen", {
    conversationId,
    messageId,
    userId: uid
  });

  res.json({ ok: true });
});

export default router;
