import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
  name: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  color: { type: String },
  bgColor: { type: String },
  borderColor: { type: String },
});

const Tag = mongoose.model("Tag", tagSchema);

export default Tag;
