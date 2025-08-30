import { Router } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { validatePassword } from "../utils/password";

const prisma = new PrismaClient();
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

const AVATAR_COLORS = [
  "#4C6FFF", "#12B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#E11D48", "#22C55E"
];

router.post("/register", async (req, res) => {
  try {
    let { username, displayName, password } = req.body as {
      username?: string; displayName?: string; password?: string;
    };

    const uname = (username ?? "").trim().toLowerCase();
    const dname = (displayName ?? "").trim();

    if (!uname || !/^[a-z0-9._-]{3,30}$/.test(uname)) {
      return res.status(400).json({ error: "Username must be 3–30 chars [a-z0-9._-]." });
    }
    if (!dname) return res.status(400).json({ error: "displayName required" });
    if (!password) return res.status(400).json({ error: "Password required" });

    const pwErr = validatePassword(password);
    if (pwErr) return res.status(400).json({ error: pwErr });

    const exists = await prisma.user.findUnique({ where: { username: uname } });
    if (exists) return res.status(409).json({ error: "Username is taken" });

    const hash = await bcrypt.hash(password, 10);
    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const user = await prisma.user.create({
      data: { username: uname, displayName: dname, avatarColor: randomColor, passwordHash: hash },
      select: { id: true, username: true, displayName: true, avatarColor: true, createdAt: true }
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
    return res.json({ user, token });

  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return res.status(409).json({ error: "Username is taken" });
    }
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };
    const uname = (username ?? "").trim().toLowerCase();
    if (!uname || !password) return res.status(400).json({ error: "username and password required" });

    const user = await prisma.user.findUnique({
      where: { username: uname },
      select: { id: true, username: true, displayName: true, avatarColor: true, createdAt: true, deletedAt: true, passwordHash: true }
    });

    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.deletedAt) return res.status(410).json({ error: "Account deleted" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
    const { passwordHash, ...safeUser } = user;
    return res.json({ user: safeUser, token });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
