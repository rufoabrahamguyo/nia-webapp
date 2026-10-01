import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import { requireSecret } from "./auth.js";
import { connectDb } from "./db.js";
import authRoutes from "./routes/auth.js";
import recordRoutes from "./routes/records.js";

const port = Number(process.env.PORT || 4000);
const app = express();

app.disable("x-powered-by");
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "48kb" }));
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
app.use((error, _req, res, _next) => {
  console.error("request failed");
  if (res.headersSent) return;
  res.status(500).json({ error: "request_failed" });
});

requireSecret();
await connectDb(process.env.MONGODB_URI);
app.listen(port, () => {
  console.log(`API listening on ${port}`);
});
