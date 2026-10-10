import mongoose from "mongoose";

const textPair = new mongoose.Schema(
  {
    en: { type: String, required: true, maxlength: 200 },
    sw: { type: String, required: true, maxlength: 200 },
  },
  { _id: false },
);

const helplineSchema = new mongoose.Schema(
  {
    group: { type: String, required: true, enum: ["now", "org"], index: true },
    name: textPair,
    who: textPair,
    hours: textPair,
    free: { type: Boolean, required: true },
    numbers: { type: [String], required: true },
    sms: { type: String, default: "", maxlength: 40 },
    whatsapp: { type: String, default: "", maxlength: 200 },
    siteLabel: { type: String, default: "", maxlength: 120 },
    siteHref: { type: String, default: "", maxlength: 300 },
    hidden: { type: Boolean, default: false, index: true },
    lastChecked: { type: Date, required: true },
    sort: { type: Number, default: 0 },
  },
  { timestamps: true },
);

helplineSchema.index({ hidden: 1, group: 1, sort: 1 });

export default mongoose.model("Helpline", helplineSchema);
