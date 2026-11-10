import { Router } from "express";
import mongoose from "mongoose";
import { clearSupportSession, passwordMatches, signSupportSession, unusedPasswordHash } from "../auth.js";
import { cleanText } from "../content.js";
import { requireConsent, requireSupport, requireVisitor } from "../guards.js";
import { openText, sealText } from "../recordCrypto.js";
import AuditLog from "../models/AuditLog.js";
import SupportTicket from "../models/SupportTicket.js";
import User from "../models/User.js";

const router = Router();
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CATEGORIES = new Set(["bug", "account", "content", "other"]);
const STATUSES = new Set(["open", "in_progress", "closed"]);
const REPLY_LIMIT = 40;

function sendError(res, status, error) {
  res.status(status).json({ error });
}

function readBody(value, min, max) {
  const text = cleanText(value, max);
  if (!text || text.length < min) return null;
  return text;
}

function ticketJson(ticket) {
  return {
    id: String(ticket._id),
    username: ticket.username,
    category: ticket.category,
    subject: openText(ticket.subjectSealed, ticket.userId),
    message: openText(ticket.messageSealed, ticket.userId),
    status: ticket.status,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    replies: (ticket.replies || []).map((reply) => ({
      id: String(reply._id),
      role: reply.authorRole,
      body: openText(reply.sealed, ticket.userId),
      createdAt: reply.createdAt,
    })),
  };
}

async function writeAudit(actor, action, summary) {
  const text = summary.slice(0, 200);
  await AuditLog.create({
    actorId: actor._id,
    actorEmail: actor.email,
    action,
    sealed: sealText(text, actor._id),
  });
}

router.post("/login", async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  if (!EMAIL.test(email)) {
    sendError(res, 401, "invalid_credentials");
    return;
  }
  const user = await User.findOne({ email }).select("+passwordHash role email");
  const matches = await passwordMatches(password, user?.passwordHash || unusedPasswordHash());
  if (!user?.passwordHash || user.role !== "support" || !matches) {
    sendError(res, 401, "invalid_credentials");
    return;
  }
  signSupportSession(res, user._id);
  res.json({ email: user.email });
});

router.post("/logout", (_req, res) => {
  clearSupportSession(res);
  res.json({ ok: true });
});

router.get("/me", async (req, res) => {
  const staff = await requireSupport(req, res);
  if (!staff) return;
  res.json({ email: staff.email });
});

router.get("/tickets", async (req, res) => {
  const user = await requireVisitor(req, res);
  if (!user || !requireConsent(res, user)) return;
  const tickets = await SupportTicket.find({ userId: user._id }).sort({ createdAt: -1 }).limit(50);
  res.set("Cache-Control", "private, no-store");
  res.json({ tickets: tickets.map(ticketJson) });
});

router.post("/tickets", async (req, res) => {
  const user = await requireVisitor(req, res);
  if (!user || !requireConsent(res, user)) return;
  const category = CATEGORIES.has(req.body?.category) ? req.body.category : "";
  const subject = readBody(req.body?.subject, 3, 120);
  const message = readBody(req.body?.message, 10, 2000);
  if (!category || !subject || !message) {
    sendError(res, 400, "invalid_ticket");
    return;
  }
  const ticket = await SupportTicket.create({
    userId: user._id,
    username: user.username,
    category,
    subjectSealed: sealText(subject, user._id),
    messageSealed: sealText(message, user._id),
  });
  res.set("Cache-Control", "private, no-store");
  res.status(201).json(ticketJson(ticket));
});

router.post("/tickets/:id/follow-up", async (req, res) => {
  const user = await requireVisitor(req, res);
  if (!user || !requireConsent(res, user)) return;
  if (!mongoose.isValidObjectId(req.params.id)) {
    sendError(res, 404, "ticket_missing");
    return;
  }
  const body = readBody(req.body?.message, 2, 2000);
  if (!body) {
    sendError(res, 400, "invalid_reply");
    return;
  }
  const ticket = await SupportTicket.findOne({ _id: req.params.id, userId: user._id });
  if (!ticket) {
    sendError(res, 404, "ticket_missing");
    return;
  }
  if (ticket.status === "closed") {
    sendError(res, 400, "ticket_closed");
    return;
  }
  if (ticket.replies.length >= REPLY_LIMIT) {
    sendError(res, 400, "ticket_full");
    return;
  }
  ticket.replies.push({ authorId: user._id, authorRole: "visitor", sealed: sealText(body, ticket.userId) });
  await ticket.save();
  res.set("Cache-Control", "private, no-store");
  res.json(ticketJson(ticket));
});

router.get("/queue", async (req, res) => {
  const staff = await requireSupport(req, res);
  if (!staff) return;
  const closed = req.query.status === "closed";
  const filter = closed ? { status: "closed" } : { status: { $in: ["open", "in_progress"] } };
  const tickets = await SupportTicket.find(filter).sort({ updatedAt: -1 }).limit(100);
  res.set("Cache-Control", "private, no-store");
  res.json({ tickets: tickets.map(ticketJson) });
});

router.post("/tickets/:id/reply", async (req, res) => {
  const staff = await requireSupport(req, res);
  if (!staff) return;
  if (!mongoose.isValidObjectId(req.params.id)) {
    sendError(res, 404, "ticket_missing");
    return;
  }
  const body = readBody(req.body?.message, 2, 2000);
  if (!body) {
    sendError(res, 400, "invalid_reply");
    return;
  }
  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) {
    sendError(res, 404, "ticket_missing");
    return;
  }
  if (ticket.replies.length >= REPLY_LIMIT) {
    sendError(res, 400, "ticket_full");
    return;
  }
  ticket.replies.push({ authorId: staff._id, authorRole: "support", sealed: sealText(body, ticket.userId) });
  if (ticket.status === "open") ticket.status = "in_progress";
  await ticket.save();
  await writeAudit(staff, "ticket.reply", "Replied to a support ticket");
  res.set("Cache-Control", "private, no-store");
  res.json(ticketJson(ticket));
});

router.post("/tickets/:id/status", async (req, res) => {
  const staff = await requireSupport(req, res);
  if (!staff) return;
  if (!mongoose.isValidObjectId(req.params.id)) {
    sendError(res, 404, "ticket_missing");
    return;
  }
  const status = STATUSES.has(req.body?.status) ? req.body.status : "";
  if (!status) {
    sendError(res, 400, "invalid_status");
    return;
  }
  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) {
    sendError(res, 404, "ticket_missing");
    return;
  }
  ticket.status = status;
  await ticket.save();
  await writeAudit(staff, "ticket.status", `Set a support ticket to ${status}`);
  res.set("Cache-Control", "private, no-store");
  res.json(ticketJson(ticket));
});

export default router;
