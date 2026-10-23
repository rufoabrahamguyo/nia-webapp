import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import Record from "./models/Record.js";

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

export function encryptRecord(plain, userId) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, recordKey(), iv);
  cipher.setAAD(associatedData(userId));
  const ciphertext = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(".");
}

export function decryptRecord(packed, userId) {
  const parts = String(packed).split(".");
  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new Error("record_unreadable");
  }
  const decipher = createDecipheriv(ALGO, recordKey(), Buffer.from(parts[1], "base64url"));
  decipher.setAAD(associatedData(userId));
  decipher.setAuthTag(Buffer.from(parts[2], "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(parts[3], "base64url")), decipher.final()]).toString("utf8");
}

export async function sealLegacyRecords() {
  const cursor = Record.collection.find(
    { sealed: { $exists: false }, body: { $type: "string" } },
    { projection: { body: 1, userId: 1 } },
  );
  for await (const doc of cursor) {
    if (!doc.userId) continue;
    const sealed = encryptRecord(doc.body, doc.userId);
    await Record.collection.updateOne(
      { _id: doc._id, sealed: { $exists: false } },
      { $set: { sealed }, $unset: { body: "" } },
    );
  }
}
