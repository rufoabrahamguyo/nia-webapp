import { Router } from "express";
import mongoose from "mongoose";
import { clearSession, readUserId } from "../auth.js";
import Record from "../models/Record.js";
import User from "../models/User.js";

const router = Router();
const MAX_BODY = 20000;
const MAX_NOTES = 50;

function sendError(res, status, error) {
  res.status(status).json({ error });
}

function publicRecord(record) {
  return {
    id: String(record._id),
    body: record.body,
    edited: Boolean(record.edited),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

async function requireUser(req, res) {
  const userId = readUserId(req);
  if (!userId) {
    sendError(res, 401, "invalid_credentials");
    return null;
  }
  const user = await User.findById(userId).select("_id");
  if (!user) {
    clearSession(res);
    sendError(res, 401, "invalid_credentials");
    return null;
  }
  return user;
}

function readBody(req, res) {
  const body = String(req.body?.body || "").trim();
  if (!body) {
    sendError(res, 400, "record_empty");
    return null;
  }
  if (body.length > MAX_BODY) {
    sendError(res, 400, "record_long");
    return null;
  }
  return body;
}

router.get("/", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const records = await Record.find({ userId: user._id }).sort({ updatedAt: -1 }).limit(MAX_NOTES);
  res.json({ records: records.map(publicRecord) });
});

router.post("/", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const body = readBody(req, res);
  if (!body) return;

  const count = await Record.countDocuments({ userId: user._id });
  if (count >= MAX_NOTES) {
    sendError(res, 400, "record_limit");
    return;
  }

  const record = await Record.create({ userId: user._id, body, edited: req.body?.edited === true });
  res.status(201).json(publicRecord(record));
});

router.patch("/:id", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  if (!mongoose.isValidObjectId(req.params.id)) {
    sendError(res, 404, "record_missing");
    return;
  }
  const body = readBody(req, res);
  if (!body) return;

  const record = await Record.findOneAndUpdate(
    { _id: req.params.id, userId: user._id },
    { body },
    { new: true },
  );
  if (!record) {
    sendError(res, 404, "record_missing");
    return;
  }
  res.json(publicRecord(record));
});

router.delete("/:id", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  if (!mongoose.isValidObjectId(req.params.id)) {
    sendError(res, 404, "record_missing");
    return;
  }
  const record = await Record.findOneAndDelete({ _id: req.params.id, userId: user._id });
  if (!record) {
    sendError(res, 404, "record_missing");
    return;
  }
  res.json({ ok: true });
});

export default router;
