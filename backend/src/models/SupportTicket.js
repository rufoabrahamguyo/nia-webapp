import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorRole: { type: String, required: true, enum: ["visitor", "support"] },
    sealed: { type: String, required: true, maxlength: 16000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const supportTicketSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true, maxlength: 20 },
    category: { type: String, required: true, enum: ["bug", "account", "content", "other"] },
    subjectSealed: { type: String, required: true, maxlength: 1200 },
    messageSealed: { type: String, required: true, maxlength: 16000 },
    status: { type: String, required: true, enum: ["open", "in_progress", "closed"], default: "open" },
    replies: { type: [replySchema], default: [] },
  },
  { timestamps: true },
);

supportTicketSchema.index({ userId: 1, createdAt: -1 });
supportTicketSchema.index({ status: 1, updatedAt: -1 });

export default mongoose.model("SupportTicket", supportTicketSchema);
