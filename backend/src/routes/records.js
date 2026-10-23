import { Router } from "express";
import mongoose from "mongoose";
import { hashPassword, passwordMatches, readRecordUnlock, signRecordUnlock } from "../auth.js";
import { requireVisitor } from "../guards.js";
import Record from "../models/Record.js";
import User from "../models/User.js";
import { decryptRecord, encryptRecord } from "../recordCrypto.js";

const router = Router();
const MAX_BODY = 20000;
const MAX_NOTES = 50;
const PASSCODE_FAILS = 5;
const PASSCODE_LOCK_MS = 15 * 60 * 1000;

function sendError(res, status, error) {
  res.status(status).json({ error });
}

function publicRecord(record) {
  return {
    id: String(record._id),
    body: decryptRecord(record.sealed, record.userId),
    edited: Boolean(record.edited),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function readPasscode(value) {
  const passcode = String(value || "");
  if (!/^\d{4}$/.test(passcode)) return null;
  return passcode;
}

function unlockHeader(req) {
  return readRecordUnlock(req.get("x-record-unlock") || "");
}

async function requireNotes(req, res) {
  const user = await requireVisitor(req, res);
  if (!user) return null;
  const stored = await User.findById(user._id).select("recordPasscodeHash");
  if (!stored?.recordPasscodeHash) return user;
  if (unlockHeader(req) !== String(user._id)) {
    sendError(res, 403, "record_locked");
    return null;
  }
  return user;
}

async function judgePasscode(userId, passcode) {
  const stored = await User.findById(userId).select(
    "recordPasscodeHash recordPasscodeFails recordPasscodeLockedUntil",
  );
  if (!stored?.recordPasscodeHash) return "missing";
  if (stored.recordPasscodeLockedUntil && stored.recordPasscodeLockedUntil.getTime() > Date.now()) return "locked";
  const matches = await passwordMatches(passcode, stored.recordPasscodeHash);
  if (matches) {
    if (stored.recordPasscodeFails || stored.recordPasscodeLockedUntil) {
      await User.updateOne(
        { _id: userId },
        { $set: { recordPasscodeFails: 0 }, $unset: { recordPasscodeLockedUntil: 1 } },
      );
    }
    return "ok";
  }
  const fails = (stored.recordPasscodeFails || 0) + 1;
  if (fails >= PASSCODE_FAILS) {
    await User.updateOne(
      { _id: userId },
      { $set: { recordPasscodeFails: 0, recordPasscodeLockedUntil: new Date(Date.now() + PASSCODE_LOCK_MS) } },
    );
    return "locked";
  }
  await User.updateOne({ _id: userId }, { $set: { recordPasscodeFails: fails } });
  return "wrong";
}

function rejectPasscode(res, result) {
  if (result === "ok") return false;
  if (result === "locked") sendError(res, 429, "passcode_locked");
  else if (result === "wrong") sendError(res, 401, "passcode_wrong");
  else sendError(res, 400, "passcode_invalid");
  return true;
}

router.get("/status", async (req, res) => {
  const user = await requireVisitor(req, res);
  if (!user) return;
  const stored = await User.findById(user._id).select("recordPasscodeHash");
  res.json({ passcode: Boolean(stored?.recordPasscodeHash) });
});

router.post("/unlock", async (req, res) => {
  const user = await requireVisitor(req, res);
  if (!user) return;
  const passcode = readPasscode(req.body?.passcode);
  if (!passcode) {
    sendError(res, 400, "passcode_invalid");
    return;
  }
  const result = await judgePasscode(user._id, passcode);
  if (rejectPasscode(res, result)) return;
  res.json({ token: signRecordUnlock(user._id) });
});

router.post("/passcode", async (req, res) => {
  const user = await requireVisitor(req, res);
  if (!user) return;
  const passcode = readPasscode(req.body?.passcode);
  if (!passcode) {
    sendError(res, 400, "passcode_invalid");
    return;
  }
  const stored = await User.findById(user._id).select("recordPasscodeHash");
  if (stored?.recordPasscodeHash) {
    const current = readPasscode(req.body?.current);
    if (!current) {
      sendError(res, 400, "passcode_invalid");
      return;
    }
    const result = await judgePasscode(user._id, current);
    if (rejectPasscode(res, result)) return;
  }
  await User.updateOne(
    { _id: user._id },
    {
      $set: { recordPasscodeHash: await hashPassword(passcode), recordPasscodeFails: 0 },
      $unset: { recordPasscodeLockedUntil: 1 },
    },
  );
  res.json({ token: signRecordUnlock(user._id) });
});

router.delete("/passcode", async (req, res) => {
  const user = await requireVisitor(req, res);
  if (!user) return;
  const stored = await User.findById(user._id).select("recordPasscodeHash");
  if (!stored?.recordPasscodeHash) {
    res.json({ ok: true });
    return;
  }
  const passcode = readPasscode(req.body?.passcode);
  if (!passcode) {
    sendError(res, 400, "passcode_invalid");
    return;
  }
  const result = await judgePasscode(user._id, passcode);
  if (rejectPasscode(res, result)) return;
  await User.updateOne(
    { _id: user._id },
    { $set: { recordPasscodeFails: 0 }, $unset: { recordPasscodeHash: 1, recordPasscodeLockedUntil: 1 } },
  );
  res.json({ ok: true });
});

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
  const user = await requireNotes(req, res);
  if (!user) return;
  const records = await Record.find({ userId: user._id }).sort({ updatedAt: -1 }).limit(MAX_NOTES);
  res.json({ records: records.map(publicRecord) });
});

router.post("/", async (req, res) => {
  const user = await requireNotes(req, res);
  if (!user) return;
  const body = readBody(req, res);
  if (!body) return;

  const count = await Record.countDocuments({ userId: user._id });
  if (count >= MAX_NOTES) {
    sendError(res, 400, "record_limit");
    return;
  }

  const record = await Record.create({
    userId: user._id,
    sealed: encryptRecord(body, user._id),
    edited: req.body?.edited === true,
  });
  res.status(201).json(publicRecord(record));
});

router.patch("/:id", async (req, res) => {
  const user = await requireNotes(req, res);
  if (!user) return;
  if (!mongoose.isValidObjectId(req.params.id)) {
    sendError(res, 404, "record_missing");
    return;
  }
  const body = readBody(req, res);
  if (!body) return;

  const record = await Record.findOneAndUpdate(
    { _id: req.params.id, userId: user._id },
    { sealed: encryptRecord(body, user._id) },
    { new: true },
  );
  if (!record) {
    sendError(res, 404, "record_missing");
    return;
  }
  res.json(publicRecord(record));
});

router.delete("/:id", async (req, res) => {
  const user = await requireNotes(req, res);
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
