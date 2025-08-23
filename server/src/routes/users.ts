import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { id: true, username: true, displayName: true, avatarColor: true, createdAt: true }
  });
  res.json({ user });
});

router.patch("/me", requireAuth, async (req: AuthedRequest, res) => {
  const { displayName, avatarColor } = req.body as { displayName?: string; avatarColor?: string };
  const allowed = ['#4C6FFF', '#12B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#E11D48', '#22C55E'];

  if (avatarColor && !allowed.includes(avatarColor)) {
    return res.status(400).json({ error: "Invalid color" });
  }
  if (displayName && displayName.trim().length < 2) {
    return res.status(400).json({ error: "Display name too short" });
  }

  const updated = await prisma.user.update({
    where: { id: req.userId! },
    data: {
      ...(displayName ? { displayName: displayName.trim() } : {}),
      ...(avatarColor ? { avatarColor } : {})
    },
    select: { id: true, username: true, displayName: true, avatarColor: true }
  });

  res.json({ user: updated });
});

router.get("/search", requireAuth, async (req: AuthedRequest, res) => {
  const uid = req.userId!;
  const raw = String(req.query.query ?? "").trim();
  if (!raw) return res.json({ users: [] });

  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      id: { not: uid },
      OR: [
        { username: { contains: raw, mode: "insensitive" } },
        { displayName: { contains: raw, mode: "insensitive" } },
      ],
    },
    orderBy: [{ displayName: "asc" }, { username: "asc" }],
    take: 20,
    select: { id: true, username: true, displayName: true, avatarColor: true, deletedAt: true },
  });

  res.json({ users });
});

router.delete("/me", requireAuth, async (req: AuthedRequest, res) => {
  const uid = req.userId!;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: uid },
      data: {
        deletedAt: new Date(),
        displayName: "Deleted User",
        avatarColor: "#94A3B8",
      },
    });

    await tx.friendRequest.deleteMany({
      where: { OR: [{ fromId: uid }, { toId: uid }] },
    });

  });

  return res.json({ ok: true });
});

export default router;
