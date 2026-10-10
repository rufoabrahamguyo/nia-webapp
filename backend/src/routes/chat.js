import { Router } from "express";
import mongoose from "mongoose";
import { requireVisitor } from "../guards.js";
import Comment from "../models/Comment.js";
import Story from "../models/Story.js";

const router = Router();
const STORY_MAX = 4000;
const COMMENT_MAX = 1000;
const STORY_LIMIT = 20;
const PAGE = 20;

function sendError(res, status, error) {
  res.status(status).json({ error });
}

function cleanBody(value, max) {
  const body = String(value || "").replace(/\u0000/g, "").trim();
  if (!body) return { error: "chat_empty" };
  if (body.length > max) return { error: "chat_long" };
  return { body };
}

function storyJson(story, userId) {
  return {
    id: String(story._id),
    authorName: story.authorName,
    body: story.body,
    status: story.status,
    createdAt: story.createdAt,
    mine: String(story.userId) === String(userId),
  };
}

function commentJson(comment, userId) {
  return {
    id: String(comment._id),
    authorName: comment.authorName,
    body: comment.body,
    status: comment.status,
    createdAt: comment.createdAt,
    mine: String(comment.userId) === String(userId),
  };
}

async function commentsFor(storyIds, userId) {
  if (storyIds.length === 0) return new Map();
  const comments = await Comment.find({
    storyId: { $in: storyIds },
    $or: [{ status: "allowed" }, { userId }],
  }).sort({ createdAt: 1 });
  const grouped = new Map();
  for (const comment of comments) {
    const key = String(comment.storyId);
    const list = grouped.get(key) || [];
    list.push(commentJson(comment, userId));
    grouped.set(key, list);
  }
  return grouped;
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
  const grouped = await commentsFor([...stories, ...mine].map((story) => story._id), user._id);

  res.set("Cache-Control", "private, no-store");
  res.json({
    stories: stories.map((story) => ({ ...storyJson(story, user._id), comments: grouped.get(String(story._id)) || [] })),
    mine: mine.map((story) => ({ ...storyJson(story, user._id), comments: grouped.get(String(story._id)) || [] })),
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
    status: "pending",
  });
  res.status(201).json({ ...storyJson(story, user._id), comments: [] });
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
  await Comment.deleteMany({ storyId: story._id });
  res.json({ ok: true });
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
  const comment = await Comment.create({
    storyId: story._id,
    userId: user._id,
    authorName: user.username,
    body: parsed.body,
    status: "pending",
  });
  res.status(201).json(commentJson(comment, user._id));
});

export default router;
