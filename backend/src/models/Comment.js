import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    storyId: { type: mongoose.Schema.Types.ObjectId, ref: "Story", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true, maxlength: 40 },
    sealed: { type: String, required: true, maxlength: 8000 },
    staff: { type: Boolean, default: false },
    status: { type: String, required: true, enum: ["pending", "allowed", "hidden"], default: "allowed" },
    holdReason: { type: String, enum: ["", "contact", "blocked_word", "reports", "support"], default: "" },
    reportCount: { type: Number, default: 0 },
    reviewedReportCount: { type: Number, default: 0 },
    needsReview: { type: Boolean, default: false },
  },
  { timestamps: true },
);

commentSchema.index({ storyId: 1, status: 1, createdAt: 1 });

export default mongoose.model("Comment", commentSchema);
