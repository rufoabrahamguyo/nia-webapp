import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import { existsSync } from "node:fs";
import path from "node:path";
import { requireSecret } from "./auth.js";
import { avatarForKey } from "./avatars.js";
import { releaseLegacyQueue } from "./chatQueue.js";
import User from "./models/User.js";
import { requireRecordKey, sealLegacyRecords } from "./recordCrypto.js";
import { connectDb } from "./db.js";
import { ensureAdmin, seedHelplines } from "./seed.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import helplineRoutes from "./routes/helplines.js";
import pageRoutes from "./routes/pages.js";
import recordRoutes from "./routes/records.js";

const port = Number(process.env.PORT || 4000);
const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "256kb" }));
app.use(cookieParser());
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "request_failed" },
  }),
);
app.use("/api/auth", authRoutes);
app.use(
  "/api/records",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "request_failed" },
  }),
);
app.use("/api/records", recordRoutes);
app.use("/api/helplines", helplineRoutes);
app.use("/api/pages", pageRoutes);
app.use(
  "/api/chat",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "request_failed" },
  }),
);
app.use("/api/chat", chatRoutes);
app.use(
  "/api/admin/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "request_failed" },
  }),
);
app.use("/api/admin", adminRoutes);
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});
app.use((error, _req, res, _next) => {
  console.error("request failed");
  if (res.headersSent) return;
  res.status(500).json({ error: "request_failed" });
});

const dist = path.resolve(process.cwd(), "../frontend/dist");
if (existsSync(path.join(dist, "index.html"))) {
  app.use(express.static(dist, { index: false }));
  app.use((req, res) => {
    if (req.path.startsWith("/api") || (req.method !== "GET" && req.method !== "HEAD")) {
      res.status(404).json({ error: "request_failed" });
      return;
    }
    res.sendFile(path.join(dist, "index.html"));
  });
}

requireSecret();
requireRecordKey();
await connectDb(process.env.MONGODB_URI);
await sealLegacyRecords();
await releaseLegacyQueue();
const missingAvatars = await User.find({
  $or: [{ avatar: { $exists: false } }, { avatar: null }, { avatar: "" }],
}).select("_id");
await Promise.all(missingAvatars.map((user) => User.updateOne({ _id: user._id }, { $set: { avatar: avatarForKey(user._id) } })));
await User.updateMany(
  { passwordHash: { $exists: true, $nin: [null, ""] }, hasPassword: { $ne: true } },
  { $set: { hasPassword: true } },
);
await seedHelplines();
await ensureAdmin();
app.listen(port, () => {
  console.log(`API listening on ${port}`);
});
