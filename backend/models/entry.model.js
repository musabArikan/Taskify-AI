import mongoose from "mongoose";

const entrySchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    aiContent: { type: String, default: "" },
    isPinned: { type: Boolean, default: false },
    files: { type: [String], default: [] },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

const Entry = mongoose.model("Entry", entrySchema);

export default Entry;
