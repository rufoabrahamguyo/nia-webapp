import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    authorName: { type: String, required: true, maxlength: 40 },
    body: { type: String, required: true, maxlength: 4000 },
    status: { type: String, required: true, enum: ["pending", "allowed", "hidden"], default: "pending", index: true },
  },
  { timestamps: true },
);

storySchema.index({ status: 1, createdAt: -1 });
storySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Story", storySchema);
