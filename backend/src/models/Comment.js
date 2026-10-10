import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    storyId: { type: mongoose.Schema.Types.ObjectId, ref: "Story", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true, maxlength: 40 },
    body: { type: String, required: true, maxlength: 1000 },
    status: { type: String, required: true, enum: ["pending", "allowed", "hidden"], default: "pending" },
  },
  { timestamps: true },
);

commentSchema.index({ storyId: 1, status: 1, createdAt: 1 });

export default mongoose.model("Comment", commentSchema);
