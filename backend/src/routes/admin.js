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

function chatFields(entry) {
  return {
    status: entry.status,
    holdReason: entry.holdReason || "",
    reportCount: entry.reportCount || 0,
    needsReview: Boolean(entry.needsReview),
  };
}

function chatStoryJson(story, comments) {
  return {
    id: String(story._id),
    authorName: story.authorName,
    body: story.body,
    createdAt: story.createdAt,
    queueAt: story.queueAt || story.createdAt,
    ...chatFields(story),
    comments: comments.map((comment) => ({
      id: String(comment._id),
      authorName: comment.authorName,
      body: comment.body,
      createdAt: comment.createdAt,
      ...chatFields(comment),
    })),
  };
}

async function reviewQuery(before) {
  await Story.updateMany(
    { status: "pending", queueAt: { $exists: false } },
    [{ $set: { queueAt: "$createdAt", needsReview: true } }],
  );
  const staleComments = await Comment.find({ status: "pending", needsReview: { $ne: true } }).select("storyId");
  if (staleComments.length) {
    await Comment.updateMany({ _id: { $in: staleComments.map((comment) => comment._id) } }, { $set: { needsReview: true } });
    await Story.updateMany(
      { _id: { $in: staleComments.map((comment) => comment.storyId) }, queueAt: { $exists: false } },
      [{ $set: { queueAt: "$createdAt" } }],
    );
  }
  const commentStoryIds = await Comment.distinct("storyId", {
    $or: [{ status: "pending" }, { needsReview: true, status: "allowed" }],
  });
  await Story.updateMany(
    { _id: { $in: commentStoryIds }, queueAt: { $exists: false }, status: { $ne: "hidden" } },
    [{ $set: { queueAt: "$createdAt" } }],
  );
  const query = {
    status: { $ne: "hidden" },
    $or: [{ status: "pending" }, { needsReview: true }, { _id: { $in: commentStoryIds } }],
  };
  if (Number.isFinite(before)) query.queueAt = { $lt: new Date(before) };
  return query;
}

router.get("/chat", async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const status = ["review", "allowed", "hidden"].includes(req.query.status) ? req.query.status : "review";
  const before = Date.parse(String(req.query.before || ""));
  const query = status === "review" ? await reviewQuery(before) : { status };
  if (status !== "review" && Number.isFinite(before)) query.createdAt = { $lt: new Date(before) };
  const found = await Story.find(query).sort(status === "review" ? { queueAt: -1, createdAt: -1 } : { createdAt: -1 }).limit(21);
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
  const story = await Story.findById(req.params.id);
  if (!story) {
    sendError(res, 404, "chat_missing");
    return;
  }
  const reported = story.holdReason === "reports" || (story.reportCount || 0) > (story.reviewedReportCount || 0);
  const held = Boolean(story.holdReason) && story.holdReason !== "reports";
  if (status === "allowed") {
    story.status = "allowed";
    story.needsReview = false;
    story.holdReason = "";
    story.reviewedReportCount = story.reportCount || 0;
  } else {
    story.status = "hidden";
    story.needsReview = false;
  }
  await story.save();
  const summary = status === "allowed"
    ? reported ? "Allowed a reported NiaChat story" : held ? "Allowed a held NiaChat story" : "Allowed a NiaChat story"
    : reported ? "Hid a reported NiaChat story" : "Hid a NiaChat story";
  await writeAudit(admin, status === "allowed" ? "chat.story.allow" : "chat.story.hide", summary);
  res.json({ id: String(story._id), ...chatFields(story), queueAt: story.queueAt || story.createdAt });
});

router.post("/chat/comments/:id", async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const status = req.body?.status === "allowed" || req.body?.status === "hidden" ? req.body.status : "";
  if (!status || !mongoose.isValidObjectId(req.params.id)) {
    sendError(res, 400, "invalid_chat");
    return;
  }
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    sendError(res, 404, "chat_missing");
    return;
  }
  const reported = comment.holdReason === "reports" || (comment.reportCount || 0) > (comment.reviewedReportCount || 0);
  const held = Boolean(comment.holdReason) && comment.holdReason !== "reports";
  if (status === "allowed") {
    comment.status = "allowed";
    comment.needsReview = false;
    comment.holdReason = "";
    comment.reviewedReportCount = comment.reportCount || 0;
  } else {
    comment.status = "hidden";
    comment.needsReview = false;
  }
  await comment.save();
  const summary = status === "allowed"
    ? reported ? "Allowed a reported NiaChat comment" : held ? "Allowed a held NiaChat comment" : "Allowed a NiaChat comment"
    : reported ? "Hid a reported NiaChat comment" : "Hid a NiaChat comment";
  await writeAudit(admin, status === "allowed" ? "chat.comment.allow" : "chat.comment.hide", summary);
  res.json({ id: String(comment._id), ...chatFields(comment) });
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
