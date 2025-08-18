import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  res.json({ user });
});

router.get('/search', requireAuth, async (req: AuthedRequest, res) => {
  const q = String(req.query.query ?? '').trim();
  if (!q) return res.json({ users: [] });

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: q, mode: 'insensitive' } },
        { displayName: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: { id: true, username: true, displayName: true },
    take: 20,
  });

  res.json({ users });
});

export default router;
