import { Router } from "express";
import mongoose from "mongoose";
import { clearAdminSession, passwordMatches, signAdminSession, unusedPasswordHash } from "../auth.js";
import { checkedDate, httpsUrl, localeJson, optionalText, pair, phoneList, readLocale } from "../content.js";
import { requireAdmin } from "../guards.js";
import AuditLog from "../models/AuditLog.js";
import Comment from "../models/Comment.js";
import Helpline from "../models/Helpline.js";
import Page from "../models/Page.js";
import Story from "../models/Story.js";
import User from "../models/User.js";

const router = Router();
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sendError(res, status, error) {
  res.status(status).json({ error });
}

async function writeAudit(admin, action, summary) {
  await AuditLog.create({
    actorId: admin._id,
    actorEmail: admin.email,
    action,
    summary: summary.slice(0, 200),
  });
}

function dateKey(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function helplineJson(entry) {
  return {
    id: String(entry._id),
    group: entry.group,
    name: entry.name,
    who: entry.who,
    hours: entry.hours,
    free: Boolean(entry.free),
    numbers: entry.numbers,
    sms: entry.sms || "",
    whatsapp: entry.whatsapp || "",
    siteLabel: entry.siteLabel || "",
    siteHref: entry.siteHref || "",
    hidden: Boolean(entry.hidden),
    lastChecked: dateKey(entry.lastChecked),
    sort: entry.sort || 0,
  };
}

function readHelpline(body) {
  const group = body?.group === "org" ? "org" : body?.group === "now" ? "now" : "";
  const name = pair(body?.name);
  const who = pair(body?.who);
  const hours = pair(body?.hours);
  const numbers = phoneList(body?.numbers);
  const sms = optionalText(body?.sms, 40);
  const whatsapp = httpsUrl(body?.whatsapp);
  const siteLabel = optionalText(body?.siteLabel, 120);
  const siteHref = httpsUrl(body?.siteHref);
  const lastChecked = checkedDate(body?.lastChecked);
  const sort = Number(body?.sort);
  if (!group || !name || !who || !hours || !numbers || sms == null || whatsapp == null || siteLabel == null || siteHref == null || !lastChecked) {
    return null;
  }
  if ((siteLabel && !siteHref) || (!siteLabel && siteHref)) return null;
  if (!Number.isInteger(sort) || sort < 0 || sort > 999) return null;
  return {
    group,
    name,
    who,
    hours,
    free: Boolean(body?.free),
    numbers,
    sms,
    whatsapp,
    siteLabel,
    siteHref,
    hidden: Boolean(body?.hidden),
    lastChecked,
    sort,
  };
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
  if (!user?.passwordHash || user.role !== "admin" || !matches) {
    sendError(res, 401, "invalid_credentials");
    return;
  }
  signAdminSession(res, user._id);
  res.json({ email: user.email });
});

router.post("/logout", (_req, res) => {
  clearAdminSession(res);
  res.json({ ok: true });
});

router.get("/me", async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  res.json({ email: admin.email });
});

router.get("/helplines", async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const helplines = await Helpline.find().sort({ sort: 1, "name.en": 1 }).limit(200);
  res.json({ helplines: helplines.map(helplineJson) });
});

router.post("/helplines", async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const fields = readHelpline(req.body);
  if (!fields) {
    sendError(res, 400, "invalid_helpline");
    return;
  }
  const entry = await Helpline.create(fields);
  await writeAudit(admin, fields.hidden ? "helpline.hide" : "helpline.create", `Added helpline: ${fields.name.en}`);
  res.status(201).json(helplineJson(entry));
});

router.patch("/helplines/:id", async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  if (!mongoose.isValidObjectId(req.params.id)) {
    sendError(res, 404, "helpline_missing");
    return;
  }
  const fields = readHelpline(req.body);
  if (!fields) {
    sendError(res, 400, "invalid_helpline");
    return;
  }
  const entry = await Helpline.findByIdAndUpdate(req.params.id, fields, { new: true });
  if (!entry) {
    sendError(res, 404, "helpline_missing");
    return;
  }
  const action = fields.hidden ? "helpline.hide" : "helpline.update";
  const verb = fields.hidden ? "Hid helpline" : "Updated helpline";
  await writeAudit(admin, action, `${verb}: ${fields.name.en}`);
  res.json(helplineJson(entry));
});

router.get("/pages", async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const pages = await Page.find({ key: { $in: ["learn", "rights"] } });
  const body = { learn: null, rights: null };
  for (const page of pages) body[page.key] = { en: localeJson(page.en), sw: localeJson(page.sw) };
  res.json({ pages: body });
});

router.put("/pages/:key", async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const key = req.params.key === "learn" || req.params.key === "rights" ? req.params.key : "";
  if (!key) {
    sendError(res, 404, "page_missing");
    return;
  }
  const en = readLocale(req.body?.en, key === "learn");
  const sw = readLocale(req.body?.sw, key === "learn");
  if (!en || !sw) {
    sendError(res, 400, "invalid_page");
    return;
  }
  const page = await Page.findOneAndUpdate({ key }, { key, en, sw }, { new: true, upsert: true, setDefaultsOnInsert: true });
  await writeAudit(admin, "page.update", key === "learn" ? "Updated the Learn page" : "Updated the Rights page");
  res.json({ en: localeJson(page.en), sw: localeJson(page.sw) });
});

function chatStoryJson(story, comments) {
  return {
    id: String(story._id),
    authorName: story.authorName,
    body: story.body,
    status: story.status,
    createdAt: story.createdAt,
    comments: comments.map((comment) => ({
      id: String(comment._id),
      authorName: comment.authorName,
      body: comment.body,
      status: comment.status,
      createdAt: comment.createdAt,
    })),
  };
}

router.get("/chat", async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const status = ["pending", "allowed", "hidden"].includes(req.query.status) ? req.query.status : "pending";
  const before = Date.parse(String(req.query.before || ""));
  const query = { status };
  if (Number.isFinite(before)) query.createdAt = { $lt: new Date(before) };
  const found = await Story.find(query).sort({ createdAt: -1 }).limit(21);
  const hasMore = found.length > 20;
  const stories = found.slice(0, 20);
  const comments = await Comment.find({ storyId: { $in: stories.map((story) => story._id) } }).sort({ createdAt: 1 });
  const grouped = new Map();
  for (const comment of comments) {
    const key = String(comment.storyId);
    const list = grouped.get(key) || [];
    list.push(comment);
    grouped.set(key, list);
  }
  res.json({
    stories: stories.map((story) => chatStoryJson(story, grouped.get(String(story._id)) || [])),
    hasMore,
  });
});

router.post("/chat/stories/:id", async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const status = req.body?.status === "allowed" || req.body?.status === "hidden" ? req.body.status : "";
  if (!status || !mongoose.isValidObjectId(req.params.id)) {
    sendError(res, 400, "invalid_chat");
    return;
  }
  const story = await Story.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!story) {
    sendError(res, 404, "chat_missing");
    return;
  }
  await writeAudit(admin, status === "allowed" ? "chat.story.allow" : "chat.story.hide", status === "allowed" ? "Allowed a NiaChat story" : "Hid a NiaChat story");
  res.json({ id: String(story._id), status: story.status });
});

router.post("/chat/comments/:id", async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const status = req.body?.status === "allowed" || req.body?.status === "hidden" ? req.body.status : "";
  if (!status || !mongoose.isValidObjectId(req.params.id)) {
    sendError(res, 400, "invalid_chat");
    return;
  }
  const comment = await Comment.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!comment) {
    sendError(res, 404, "chat_missing");
    return;
  }
  await writeAudit(admin, status === "allowed" ? "chat.comment.allow" : "chat.comment.hide", status === "allowed" ? "Allowed a NiaChat comment" : "Hid a NiaChat comment");
  res.json({ id: String(comment._id), status: comment.status });
});

router.get("/audit", async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const before = Date.parse(String(req.query.before || ""));
  const query = {};
  if (Number.isFinite(before)) query.createdAt = { $lt: new Date(before) };
  const found = await AuditLog.find(query).sort({ createdAt: -1 }).limit(41);
  const hasMore = found.length > 40;
  res.json({
    entries: found.slice(0, 40).map((entry) => ({
      id: String(entry._id),
      actorEmail: entry.actorEmail,
      action: entry.action,
      summary: entry.summary,
      createdAt: entry.createdAt,
    })),
    hasMore,
  });
});

export default router;
