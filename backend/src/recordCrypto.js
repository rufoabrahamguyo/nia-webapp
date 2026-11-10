import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import AuditLog from "./models/AuditLog.js";
import Comment from "./models/Comment.js";
import Record from "./models/Record.js";
import Story from "./models/Story.js";
import SupportTicket from "./models/SupportTicket.js";
import User from "./models/User.js";

const ALGO = "aes-256-gcm";
const VERSION = "v1";

function recordKey() {
  const key = Buffer.from(String(process.env.RECORD_KEY || "").trim(), "base64");
  if (key.length !== 32) {
    throw new Error("RECORD_KEY must be 32 bytes, base64");
  }
  return key;
}

export function requireRecordKey() {
  recordKey();
}

function associatedData(userId) {
  return Buffer.from(String(userId), "utf8");
}

export function sealText(plain, ownerId) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, recordKey(), iv);
  cipher.setAAD(associatedData(ownerId));
  const ciphertext = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(".");
}

export function openText(packed, ownerId) {
  const parts = String(packed).split(".");
  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new Error("record_unreadable");
  }
  const decipher = createDecipheriv(ALGO, recordKey(), Buffer.from(parts[1], "base64url"));
  decipher.setAAD(associatedData(ownerId));
  decipher.setAuthTag(Buffer.from(parts[2], "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(parts[3], "base64url")), decipher.final()]).toString("utf8");
}

export const encryptRecord = sealText;
export const decryptRecord = openText;

async function sealOwnedBodies(collection) {
  const cursor = collection.find(
    { sealed: { $exists: false }, body: { $type: "string" } },
    { projection: { body: 1, userId: 1 } },
  );
  for await (const doc of cursor) {
    if (!doc.userId) continue;
    await collection.updateOne(
      { _id: doc._id, sealed: { $exists: false } },
      { $set: { sealed: sealText(doc.body, doc.userId) }, $unset: { body: "" } },
    );
  }
}

async function sealTickets() {
  const cursor = SupportTicket.collection.find({
    $or: [
      { subject: { $type: "string" } },
      { message: { $type: "string" } },
      { "replies.body": { $type: "string" } },
    ],
  });
  for await (const doc of cursor) {
    if (!doc.userId) continue;
    const $set = {};
    const $unset = {};
    if (typeof doc.subject === "string") {
      $set.subjectSealed = sealText(doc.subject, doc.userId);
      $unset.subject = "";
    }
    if (typeof doc.message === "string") {
      $set.messageSealed = sealText(doc.message, doc.userId);
      $unset.message = "";
    }
    if (Array.isArray(doc.replies) && doc.replies.some((reply) => typeof reply.body === "string")) {
      $set.replies = doc.replies.map((reply) => {
        if (typeof reply.body !== "string") return reply;
        const { body, ...rest } = reply;
        return { ...rest, sealed: sealText(body, doc.userId) };
      });
    }
    if (!Object.keys($set).length) continue;
    const update = { $set };
    if (Object.keys($unset).length) update.$unset = $unset;
    await SupportTicket.collection.updateOne({ _id: doc._id }, update);
  }
}

async function sealAudit() {
  const cursor = AuditLog.collection.find(
    { sealed: { $exists: false }, summary: { $type: "string" } },
    { projection: { summary: 1, actorId: 1 } },
  );
  for await (const doc of cursor) {
    if (!doc.actorId) continue;
    await AuditLog.collection.updateOne(
      { _id: doc._id, sealed: { $exists: false } },
      { $set: { sealed: sealText(doc.summary, doc.actorId) }, $unset: { summary: "" } },
    );
  }
}

async function sealConsent() {
  const cursor = User.collection.find(
    { consentSignatureSealed: { $exists: false }, consentSignature: { $type: "string" } },
    { projection: { consentSignature: 1 } },
  );
  for await (const doc of cursor) {
    if (!doc.consentSignature) {
      await User.collection.updateOne({ _id: doc._id }, { $unset: { consentSignature: "" } });
      continue;
    }
    await User.collection.updateOne(
      { _id: doc._id, consentSignatureSealed: { $exists: false } },
      { $set: { consentSignatureSealed: sealText(doc.consentSignature, doc._id) }, $unset: { consentSignature: "" } },
    );
  }
}

export async function sealLegacyRecords() {
  await sealOwnedBodies(Record.collection);
}

export async function sealStoredText() {
  await sealLegacyRecords();
  await sealOwnedBodies(Story.collection);
  await sealOwnedBodies(Comment.collection);
  await sealTickets();
  await sealAudit();
  await sealConsent();
}
