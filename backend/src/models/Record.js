import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sealed: { type: String, required: true, maxlength: 90000 },
    edited: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("Record", recordSchema);
