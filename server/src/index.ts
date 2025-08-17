import express from "express";
import cors from "cors";
import http from "http";
import { initSocket } from "./realtime/socket";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import friendRoutes from "./routes/friends";
import conversationRoutes from "./routes/conversations";
import messageRoutes from "./routes/messages";
import receiptRoutes from "./routes/receipts";

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/friends", friendRoutes);
app.use("/conversations", conversationRoutes);
app.use("/messages", messageRoutes);
app.use("/receipts", receiptRoutes);

app.get("/", (_req, res) => res.send("Cnectd API is running 🚀"));

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

// init Socket.IO
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server + Socket.IO on http://localhost:${PORT}`);
});
