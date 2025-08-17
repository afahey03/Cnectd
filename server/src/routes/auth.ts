import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Register new user
router.post("/register", async (req, res) => {
  const { username, displayName } = req.body;

  if (!username || !displayName) {
    return res.status(400).json({ error: "Username and displayName required" });
  }

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

// Check availability
router.get("/check-username/:name", async (req, res) => {
  const name = String(req.params.name || "").trim().toLowerCase();
  if (!name || name.length < 3) return res.json({ available: false });
  const existing = await prisma.user.findUnique({ where: { username: name } });
  res.json({ available: !existing });
});

export default router;
