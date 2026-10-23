import { Router } from "express";
import mongoose from "mongoose";
import { moderationFields } from "../chatSafety.js";
import { requireVisitor } from "../guards.js";
import Comment from "../models/Comment.js";
import Reaction from "../models/Reaction.js";
import Report from "../models/Report.js";
import Story from "../models/Story.js";
import User from "../models/User.js";

const router = Router();
const STORY_MAX = 4000;
const COMMENT_MAX = 1000;
const STORY_LIMIT = 20;
const PAGE = 20;
const REPORTS_TO_HIDE = 3;
const EMOJIS = ["care", "thanks", "strength", "hope"];

function sendError(res, status, error) {
  res.status(status).json({ error });
}

function cleanBody(value, max) {
  const body = String(value || "").replace(/\u0000/g, "").trim();
  if (!body) return { error: "chat_empty" };
  if (body.length > max) return { error: "chat_long" };
  return { body };
}

function storyJson(story, userId, reported, avatar = "cat", reactions = []) {
  return {
    id: String(story._id),
    authorName: story.authorName,
    authorAvatar: avatar || "cat",
    body: story.body,
    status: story.status,
    createdAt: story.createdAt,
    mine: String(story.userId) === String(userId),
    reported: Boolean(reported),
    reactions,
  };
}

function commentJson(comment, userId, reported, avatar = "cat", reactions = []) {
  return {
    id: String(comment._id),
    authorName: comment.authorName,
    authorAvatar: avatar || "cat",
    body: comment.body,
    status: comment.status,
    createdAt: comment.createdAt,
    mine: String(comment.userId) === String(userId),
    reported: Boolean(reported),
    reactions,
  };
}

function summarizeReactions(rows, userId) {
  return EMOJIS.map((emoji) => {
    const matches = rows.filter((row) => row.emoji === emoji);
    return {
      emoji,
      count: matches.length,
      mine: matches.some((row) => String(row.userId) === String(userId)),
    };
  }).filter((item) => item.count > 0);
}

async function avatarMap(userIds) {
  if (!userIds.length) return new Map();
  const users = await User.find({ _id: { $in: userIds } }).select("avatar");
  return new Map(users.map((entry) => [String(entry._id), entry.avatar || "cat"]));
}

async function reactionMap(userId, storyIds, commentIds) {
  const clauses = [];
  if (storyIds.length) clauses.push({ targetType: "story", targetId: { $in: storyIds } });
  if (commentIds.length) clauses.push({ targetType: "comment", targetId: { $in: commentIds } });
  if (!clauses.length) return new Map();
  const rows = await Reaction.find({ $or: clauses }).select("targetType targetId userId emoji");
  const grouped = new Map();
  for (const row of rows) {
    const key = `${row.targetType}:${row.targetId}`;
    const list = grouped.get(key) || [];
    list.push(row);
    grouped.set(key, list);
  }
  const summary = new Map();
  for (const [key, list] of grouped) summary.set(key, summarizeReactions(list, userId));
  return summary;
}

async function reportedKeys(userId, storyIds, commentIds) {
  const clauses = [];
  if (storyIds.length) clauses.push({ targetType: "story", targetId: { $in: storyIds } });
  if (commentIds.length) clauses.push({ targetType: "comment", targetId: { $in: commentIds } });
  if (!clauses.length) return new Set();
  const rows = await Report.find({ userId, $or: clauses }).select("targetType targetId");
  return new Set(rows.map((row) => `${row.targetType}:${row.targetId}`));
}

async function commentsFor(storyIds, userId, flags, avatars, reactions) {
  if (storyIds.length === 0) return new Map();
  const comments = await Comment.find({
    storyId: { $in: storyIds },
    $or: [{ status: "allowed" }, { userId }],
  }).sort({ createdAt: 1 });
  const grouped = new Map();
  for (const comment of comments) {
    const key = String(comment.storyId);
    const list = grouped.get(key) || [];
    list.push(commentJson(
      comment,
      userId,
      flags.has(`comment:${comment._id}`),
      avatars.get(String(comment.userId)),
      reactions.get(`comment:${comment._id}`) || [],
    ));
    grouped.set(key, list);
  }
  return grouped;
}

async function loadFlags(userId, stories) {
  const storyIds = stories.map((story) => story._id);
  const comments = await Comment.find({
    storyId: { $in: storyIds },
    $or: [{ status: "allowed" }, { userId }],
  }).select("_id");
  return reportedKeys(userId, storyIds, comments.map((comment) => comment._id));
}

router.get("/stories", async (req, res) => {
  const user = await requireVisitor(req, res);
  if (!user) return;

  const before = Date.parse(String(req.query.before || ""));
  const allowedQuery = { status: "allowed" };
  if (Number.isFinite(before)) allowedQuery.createdAt = { $lt: new Date(before) };

  const [allowed, mine] = await Promise.all([
    Story.find(allowedQuery).sort({ createdAt: -1 }).limit(PAGE + 1),
    Story.find({ userId: user._id, status: { $ne: "allowed" } }).sort({ createdAt: -1 }).limit(STORY_LIMIT),
  ]);
  const hasMore = allowed.length > PAGE;
  const stories = allowed.slice(0, PAGE);
  const visible = [...stories, ...mine];
  const flags = await loadFlags(user._id, visible);
  const storyIds = visible.map((story) => story._id);
  const commentIds = await Comment.find({
    storyId: { $in: storyIds },
    $or: [{ status: "allowed" }, { userId: user._id }],
  }).select("_id userId");
  const [avatars, reactions] = await Promise.all([
    avatarMap([...visible.map((story) => story.userId), ...commentIds.map((comment) => comment.userId)]),
    reactionMap(user._id, storyIds, commentIds.map((comment) => comment._id)),
  ]);
  const grouped = await commentsFor(storyIds, user._id, flags, avatars, reactions);

  res.set("Cache-Control", "private, no-store");
  res.json({
    stories: stories.map((story) => ({
      ...storyJson(story, user._id, flags.has(`story:${story._id}`), avatars.get(String(story.userId)), reactions.get(`story:${story._id}`) || []),
      comments: grouped.get(String(story._id)) || [],
    })),
    mine: mine.map((story) => ({
      ...storyJson(story, user._id, false, avatars.get(String(story.userId)), reactions.get(`story:${story._id}`) || []),
      comments: grouped.get(String(story._id)) || [],
    })),
    hasMore,
  });
});

router.post("/stories", async (req, res) => {
  const user = await requireVisitor(req, res);
  if (!user) return;
  const parsed = cleanBody(req.body?.body, STORY_MAX);
  if (parsed.error) {
    sendError(res, 400, parsed.error);
    return;
  }

  const count = await Story.countDocuments({ userId: user._id });
  if (count >= STORY_LIMIT) {
    sendError(res, 400, "chat_limit");
    return;
  }

  const story = await Story.create({
    userId: user._id,
    authorName: user.username,
    body: parsed.body,
    ...moderationFields(parsed.body),
  });
  res.status(201).json({ ...storyJson(story, user._id, false, user.avatar), comments: [] });
});

router.delete("/stories/:id", async (req, res) => {
  const user = await requireVisitor(req, res);
  if (!user) return;
  if (!mongoose.isValidObjectId(req.params.id)) {
    sendError(res, 404, "chat_missing");
    return;
  }
  const story = await Story.findOneAndDelete({ _id: req.params.id, userId: user._id });
  if (!story) {
    sendError(res, 404, "chat_missing");
    return;
  }
  const comments = await Comment.find({ storyId: story._id }).select("_id");
  const commentIds = comments.map((comment) => comment._id);
  await Comment.deleteMany({ storyId: story._id });
  const targetClauses = [
    { targetType: "story", targetId: story._id },
    { targetType: "comment", targetId: { $in: commentIds } },
  ];
  await Report.deleteMany({ $or: targetClauses });
  await Reaction.deleteMany({ $or: targetClauses });
  res.json({ ok: true });
});

async function hideIfReported(model, id, isComment) {
  const updated = await model.findByIdAndUpdate(id, { $inc: { reportCount: 1 } }, { new: true });
  if (!updated) return null;
  const openReports = (updated.reportCount || 0) - (updated.reviewedReportCount || 0);
  const hide = openReports >= REPORTS_TO_HIDE && updated.status === "allowed";
  const next = await model.findByIdAndUpdate(
    id,
    {
      $set: hide
        ? { status: "pending", needsReview: true, holdReason: "reports" }
        : { needsReview: true, holdReason: updated.holdReason || "reports" },
    },
    { new: true },
  );
  const storyId = isComment ? next.storyId : next._id;
  await Story.updateOne({ _id: storyId }, { $set: { queueAt: new Date() } });
  return next;
}

async function addReport(res, user, targetType, doc) {
  if (!doc || doc.status !== "allowed") {
    sendError(res, 404, "chat_missing");
    return;
  }
  if (String(doc.userId) === String(user._id)) {
    sendError(res, 400, "report_own");
    return;
  }
  try {
    await Report.create({ targetType, targetId: doc._id, userId: user._id });
  } catch (error) {
    if (error?.code === 11000) {
      sendError(res, 400, "report_duplicate");
      return;
    }
    throw error;
  }
  const model = targetType === "story" ? Story : Comment;
  const next = await hideIfReported(model, doc._id, targetType === "comment");
  res.json({ ok: true, status: next?.status || "allowed" });
}

router.post("/stories/:id/report", async (req, res) => {
  const user = await requireVisitor(req, res);
  if (!user) return;
  if (!mongoose.isValidObjectId(req.params.id)) {
    sendError(res, 404, "chat_missing");
    return;
  }
  const story = await Story.findById(req.params.id).select("_id userId status");
  await addReport(res, user, "story", story);
});

router.post("/stories/:id/comments", async (req, res) => {
  const user = await requireVisitor(req, res);
  if (!user) return;
  if (!mongoose.isValidObjectId(req.params.id)) {
    sendError(res, 404, "chat_missing");
    return;
  }
  const story = await Story.findById(req.params.id).select("_id status");
  if (!story || story.status !== "allowed") {
    sendError(res, 404, "chat_missing");
    return;
  }
  const parsed = cleanBody(req.body?.body, COMMENT_MAX);
  if (parsed.error) {
    sendError(res, 400, parsed.error);
    return;
  }
  const count = await Comment.countDocuments({ storyId: story._id });
  if (count >= 100) {
    sendError(res, 400, "chat_limit");
    return;
  }
  const fields = moderationFields(parsed.body);
  const comment = await Comment.create({
    storyId: story._id,
    userId: user._id,
    authorName: user.username,
    body: parsed.body,
    ...fields,
  });
  if (fields.needsReview) {
    await Story.updateOne({ _id: story._id }, { $set: { queueAt: new Date() } });
  }
  res.status(201).json(commentJson(comment, user._id, false, user.avatar));
});

router.post("/stories/:id/react", async (req, res) => {
  const user = await requireVisitor(req, res);
  if (!user) return;
  if (!mongoose.isValidObjectId(req.params.id)) {
    sendError(res, 404, "chat_missing");
    return;
  }
  const emoji = EMOJIS.includes(req.body?.emoji) ? req.body.emoji : "";
  if (!emoji) {
    sendError(res, 400, "reaction_invalid");
    return;
  }
  const story = await Story.findById(req.params.id).select("_id status");
  if (!story || story.status !== "allowed") {
    sendError(res, 404, "chat_missing");
    return;
  }
  await toggleReaction("story", story._id, user._id, emoji);
  const reactions = await reactionMap(user._id, [story._id], []);
  res.json({ reactions: reactions.get(`story:${story._id}`) || [] });
});

router.post("/comments/:id/react", async (req, res) => {
  const user = await requireVisitor(req, res);
  if (!user) return;
  if (!mongoose.isValidObjectId(req.params.id)) {
    sendError(res, 404, "chat_missing");
    return;
  }
  const emoji = EMOJIS.includes(req.body?.emoji) ? req.body.emoji : "";
  if (!emoji) {
    sendError(res, 400, "reaction_invalid");
    return;
  }
  const comment = await Comment.findById(req.params.id).select("_id status");
  if (!comment || comment.status !== "allowed") {
    sendError(res, 404, "chat_missing");
    return;
  }
  await toggleReaction("comment", comment._id, user._id, emoji);
  const reactions = await reactionMap(user._id, [], [comment._id]);
  res.json({ reactions: reactions.get(`comment:${comment._id}`) || [] });
});

async function toggleReaction(targetType, targetId, userId, emoji) {
  const existing = await Reaction.findOne({ targetType, targetId, userId });
  if (existing?.emoji === emoji) {
    await existing.deleteOne();
    return;
  }
  if (existing) {
    existing.emoji = emoji;
    await existing.save();
    return;
  }
  await Reaction.create({ targetType, targetId, userId, emoji });
}

router.post("/comments/:id/report", async (req, res) => {
  const user = await requireVisitor(req, res);
  if (!user) return;
  if (!mongoose.isValidObjectId(req.params.id)) {
    sendError(res, 404, "chat_missing");
    return;
  }
  const comment = await Comment.findById(req.params.id).select("_id userId status storyId");
  await addReport(res, user, "comment", comment);
});

export default router;
