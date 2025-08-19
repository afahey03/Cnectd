import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

const AVATAR_COLORS = [
  '#4C6FFF', '#12B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#E11D48', '#22C55E'
];

router.post("/register", async (req, res) => {
  const { username, displayName } = req.body;

  if (!username || !displayName) {
    return res.status(400).json({ error: "Username and displayName required" });
  }

  const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

  const user = await prisma.user.create({
    data: { username, displayName, avatarColor: randomColor },
    select: { id: true, username: true, displayName: true, avatarColor: true, createdAt: true }
  });

  try {
    const raw = String(username);
    const clean = raw.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { username: clean } });
    if (existing) return res.status(400).json({ error: "Username already taken" });

    const user = await prisma.user.create({
      data: { username: clean, displayName },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login (by username only for now, I'll change it later)
router.post("/login", async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username required" });
  }

  try {
    const raw = String(username);
    const clean = raw.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { username: clean } });
    if (!user) return res.status(400).json({ error: "User not found" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/check-username/:name", async (req, res) => {
  const name = String(req.params.name || "").trim().toLowerCase();
  if (!name || name.length < 3) return res.json({ available: false });
  const existing = await prisma.user.findUnique({ where: { username: name } });
  res.json({ available: !existing });
});

export default router;

