import mongoose from "mongoose";

const actionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, maxlength: 40 },
    anchor: { type: String, default: "", maxlength: 40 },
    label: { type: String, required: true, maxlength: 80 },
  },
  { _id: false },
);

const sectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 200 },
    body: { type: String, default: "", maxlength: 8000 },
    points: { type: [String], default: [] },
    action: { type: actionSchema, default: undefined },
  },
  { _id: false },
);

const localeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 200 },
    body: { type: String, required: true, maxlength: 4000 },
    sectionsTitle: { type: String, default: "", maxlength: 200 },
    sectionsLede: { type: String, default: "", maxlength: 500 },
    sections: { type: [sectionSchema], default: [] },
    guideTitle: { type: String, default: "", maxlength: 200 },
    guideLede: { type: String, default: "", maxlength: 500 },
    guideSections: { type: [sectionSchema], default: [] },
  },
  { _id: false },
);

const pageSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, enum: ["learn", "rights"] },
    en: { type: localeSchema, required: true },
    sw: { type: localeSchema, required: true },
  },
  { timestamps: true },
);

export default mongoose.model("Page", pageSchema);
