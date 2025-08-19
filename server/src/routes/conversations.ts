import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

/**
 * Create or fetch a DM between you and another user.
 * Body: { otherUserId: string }
 * Requires you two to be friends (an accepted FriendRequest either direction).
 */
router.post("/dm", requireAuth, async (req: AuthedRequest, res) => {
  const uid = req.userId!;
  const { otherUserId } = req.body as { otherUserId: string };
  if (!otherUserId) return res.status(400).json({ error: "otherUserId required" });
  if (otherUserId === uid) return res.status(400).json({ error: "Cannot DM yourself" });

  // Check friendship
  const isFriend = await prisma.friendRequest.findFirst({
    where: {
      status: "accepted",
      OR: [
        { fromId: uid, toId: otherUserId },
        { fromId: otherUserId, toId: uid },
      ],
    },
  });
  if (!isFriend) return res.status(403).json({ error: "Not friends" });

  // Find existing DM (isGroup=false) containing both users
  const existing = await prisma.conversation.findFirst({
    where: {
      isGroup: false,
      users: {
        every: { // both must be in
          id: { in: [uid, otherUserId] }
        }
      }
    },
    include: { users: true }
  });

  if (existing) return res.json({ conversation: existing });

  // Create new DM
  const conv = await prisma.conversation.create({
    data: {
      isGroup: false,
      users: { connect: [{ id: uid }, { id: otherUserId }] }
    },
    include: { users: true }
  });

  res.json({ conversation: conv });
});

/**
 * Create a group conversation with memberIds (you are automatically included).
 * Body: { name?: string, memberIds: string[] }
 */
router.post("/group", requireAuth, async (req: AuthedRequest, res) => {
  const uid = req.userId!;
  const { name, memberIds } = req.body as { name?: string; memberIds: string[] };

  if (!Array.isArray(memberIds) || memberIds.length === 0) {
    return res.status(400).json({ error: "memberIds required (non-empty array)" });
  }

  const uniqueIds = Array.from(new Set([uid, ...memberIds]));
  const users = await prisma.user.findMany({ where: { id: { in: uniqueIds } }, select: { id: true } });
  if (users.length !== uniqueIds.length) {
    return res.status(400).json({ error: "One or more users not found" });
  }

  if (uniqueIds.length < 3) {
    return res.status(400).json({ error: "Group must include at least you and 2 others" });
  }

  const conv = await prisma.conversation.create({
    data: {
      isGroup: true,
      name: name?.trim() || null,
      users: { connect: uniqueIds.map(id => ({ id })) }
    },
    include: {
      users: { select: { id: true, username: true, displayName: true } },
      messages: { take: 1, orderBy: { createdAt: "desc" } }
    }
  });

  res.json({ conversation: conv });
});

/**
 * List conversations you're in (latest message preview).
 */
router.get("/mine", requireAuth, async (req: AuthedRequest, res) => {
  const uid = req.userId!;
  const convs = await prisma.conversation.findMany({
    where: { users: { some: { id: uid } } },
    include: {
      users: { select: { id: true, username: true, displayName: true, avatarColor: true } },
      messages: { take: 1, orderBy: { createdAt: "desc" } }
    },
    orderBy: { createdAt: "desc" }
  });
  res.json({ conversations: convs });
});

export default router;
