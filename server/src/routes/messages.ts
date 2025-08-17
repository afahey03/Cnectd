import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

/**
 * Get the latest messages in a conversation you belong to
 * GET /messages/:conversationId?limit=50
 */
router.get("/:conversationId", requireAuth, async (req: AuthedRequest, res) => {
  const uid = req.userId!;
  const { conversationId } = req.params;
  const limit = Math.min(parseInt(String(req.query.limit ?? "50"), 10) || 50, 200);

  // ensure membership
  const conv = await prisma.conversation.findFirst({
    where: { id: conversationId, users: { some: { id: uid } } }
  });
  if (!conv) return res.status(403).json({ error: "Not in conversation" });

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: limit
  });

  res.json({ messages });
});

/**
 * Send a message to a conversation you belong to
 * POST /messages/:conversationId  { content: string }
 */
router.post("/:conversationId", requireAuth, async (req: AuthedRequest, res) => {
  const uid = req.userId!;
  const { conversationId } = req.params;
  const { content } = req.body as { content: string };

  if (!content || !content.trim()) return res.status(400).json({ error: "content required" });

  // ensure membership
  const conv = await prisma.conversation.findFirst({
    where: { id: conversationId, users: { some: { id: uid } } }
  });
  if (!conv) return res.status(403).json({ error: "Not in conversation" });

  const msg = await prisma.message.create({
    data: { conversationId, senderId: uid, content: content.trim() }
  });

  // (Realtime emit will be added in the next step)
  res.json({ message: msg });
});

export default router;
