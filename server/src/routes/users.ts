import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  res.json({ user });
});

router.get("/search", async (req, res) => {
  const q = String(req.query.q || "").trim().toLowerCase();
  if (!q) return res.json({ results: [] });

  const results = await prisma.user.findMany({
    where: { username: { contains: q, mode: "insensitive" } },
    select: { id: true, username: true, displayName: true },
    take: 20,
    orderBy: { username: "asc" }
  });

  res.json({ results });
});

export default router;
