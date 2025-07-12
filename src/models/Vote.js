import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  answer:   { type: mongoose.Schema.Types.ObjectId, ref: "Answer" },
  question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
  value:    { type: Number, enum: [1, -1], required: true },
}, { timestamps: true });

export default mongoose.models.Vote || mongoose.model("Vote", voteSchema);
