import mongoose from "mongoose";
import { AVATAR_IDS } from "../avatars.js";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false },
    googleId: { type: String, unique: true, sparse: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    usernameKind: { type: String, required: true, enum: ["anonymous", "chosen"] },
    avatar: { type: String, enum: AVATAR_IDS, default: "cat" },
    role: { type: String, required: true, enum: ["visitor", "admin"], default: "visitor" },
    hasPassword: { type: Boolean, default: false },
    deactivatedAt: { type: Date },
    recordPasscodeHash: { type: String, select: false },
    recordPasscodeFails: { type: Number, default: 0, select: false },
    recordPasscodeLockedUntil: { type: Date, select: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export default mongoose.model("User", userSchema);
