import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    actorEmail: { type: String, required: true, maxlength: 254 },
    action: { type: String, required: true, maxlength: 40 },
    summary: { type: String, required: true, maxlength: 200 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
