import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    authorName: { type: String, required: true, maxlength: 40 },
    body: { type: String, required: true, maxlength: 4000 },
    status: { type: String, required: true, enum: ["pending", "allowed", "hidden"], default: "allowed", index: true },
    holdReason: { type: String, enum: ["", "contact", "blocked_word", "reports"], default: "" },
    reportCount: { type: Number, default: 0 },
    reviewedReportCount: { type: Number, default: 0 },
    needsReview: { type: Boolean, default: false },
    queueAt: { type: Date },
  },
  { timestamps: true },
);

storySchema.index({ status: 1, createdAt: -1 });
storySchema.index({ needsReview: 1, queueAt: -1 });
storySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Story", storySchema);
