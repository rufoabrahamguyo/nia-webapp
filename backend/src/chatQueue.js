import Comment from "./models/Comment.js";
import Story from "./models/Story.js";

const legacyHold = {
  status: "pending",
  $and: [
    { $or: [{ holdReason: { $in: ["", null] } }, { holdReason: { $exists: false } }] },
    { $or: [{ reportCount: { $in: [0, null] } }, { reportCount: { $exists: false } }] },
  ],
};

export async function releaseLegacyQueue() {
  const fields = { status: "allowed", needsReview: false, holdReason: "" };
  await Story.updateMany(legacyHold, { $set: fields });
  await Comment.updateMany(legacyHold, { $set: fields });
}
