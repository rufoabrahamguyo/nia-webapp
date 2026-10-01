import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false },
    googleId: { type: String, unique: true, sparse: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    usernameKind: { type: String, required: true, enum: ["anonymous", "chosen"] },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export default mongoose.model("User", userSchema);
