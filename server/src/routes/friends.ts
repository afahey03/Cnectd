import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

/**
 * Send a friend request to another user by their userId
 * Body: { toUserId: string }
 */
router.post("/request", requireAuth, async (req: AuthedRequest, res) => {
  const fromId = req.userId!;
  const { toUserId } = req.body as { toUserId: string };

  if (!toUserId) return res.status(400).json({ error: "toUserId required" });
  if (toUserId === fromId) return res.status(400).json({ error: "Cannot friend yourself" });

  const existing = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { fromId, toId: toUserId },
        { fromId: toUserId, toId: fromId },
      ],
      status: { in: ["pending", "accepted"] },
    },
  });
  if (existing) {
    return res.status(400).json({ error: "Request already exists or you are already friends" });
  }

  const fr = await prisma.friendRequest.create({
    data: { fromId, toId: toUserId, status: "pending" },
  });

  res.json({ request: fr });
});

/**
 * Respond to a friend request you received
 * Body: { requestId: string, accept: boolean }
 */
router.post("/respond", requireAuth, async (req: AuthedRequest, res) => {
  const uid = req.userId!;
  const { requestId, accept } = req.body as { requestId: string; accept: boolean };

  if (!requestId) return res.status(400).json({ error: "requestId required" });

  const request = await prisma.friendRequest.findUnique({ where: { id: requestId } });
  if (!request || request.toId !== uid) return res.status(404).json({ error: "Request not found" });

  const updated = await prisma.friendRequest.update({
    where: { id: requestId },
    data: { status: accept ? "accepted" : "denied" },
  });

  res.json({ request: updated });
});

/**
 * Get your pending incoming/outgoing requests
 */
router.get("/pending", requireAuth, async (req: AuthedRequest, res) => {
  const uid = req.userId!;

  const incoming = await prisma.friendRequest.findMany({
    where: { toId: uid, status: "pending" },
    include: { from: { select: { id: true, username: true, displayName: true, avatarColor: true } } },
    orderBy: { createdAt: "desc" },
  });

  const outgoing = await prisma.friendRequest.findMany({
    where: { fromId: uid, status: "pending" },
    include: { to: { select: { id: true, username: true, displayName: true, avatarColor: true } } },
    orderBy: { createdAt: "desc" },
  });

  res.json({ incoming, outgoing });
});

/**
 * Get your accepted friends (derived from accepted requests)
 */
router.get("/list", requireAuth, async (req: AuthedRequest, res) => {
  const uid = req.userId!;

  const accepted = await prisma.friendRequest.findMany({
    where: {
      status: "accepted",
      OR: [{ fromId: uid }, { toId: uid }],
    },
    include: {
      from: { select: { id: true, username: true, displayName: true, avatarColor: true } },
      to: { select: { id: true, username: true, displayName: true, avatarColor: true } },
    },
  });

  const friends = accepted.map(fr => (fr.fromId === uid ? fr.to : fr.from));
  res.json({ friends });
});

router.post("/remove", requireAuth, async (req: AuthedRequest, res) => {
  const uid = req.userId!;
  const { otherUserId } = req.body as { otherUserId: string };

  if (!otherUserId) return res.status(400).json({ error: "otherUserId required" });
  if (otherUserId === uid) return res.status(400).json({ error: "Cannot remove yourself" });

  const result = await prisma.friendRequest.deleteMany({
    where: {
      status: "accepted",
      OR: [
        { fromId: uid, toId: otherUserId },
        { fromId: otherUserId, toId: uid },
      ],
    },
  });

  await prisma.friendRequest.deleteMany({
    where: {
      status: "pending",
      OR: [
        { fromId: uid, toId: otherUserId },
        { fromId: otherUserId, toId: uid },
      ],
    },
  });

  return res.json({ ok: true, removed: result.count });
});


export default router;
