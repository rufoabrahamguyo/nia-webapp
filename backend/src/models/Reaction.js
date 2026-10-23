import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
  {
    targetType: { type: String, required: true, enum: ["story", "comment"] },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    emoji: { type: String, required: true, enum: ["care", "thanks", "strength", "hope"] },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

reactionSchema.index({ targetType: 1, targetId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Reaction", reactionSchema);
