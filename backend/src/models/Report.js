import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    targetType: { type: String, required: true, enum: ["story", "comment"] },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

reportSchema.index({ targetType: 1, targetId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Report", reportSchema);
