import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true }, // Rich text (HTML/markdown)
  tags:        [{ type: String }],
  author:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  answers:     [{ type: mongoose.Schema.Types.ObjectId, ref: "Answer" }],
  acceptedAnswer: { type: mongoose.Schema.Types.ObjectId, ref: "Answer" },
  hasAcceptedAnswer: { type: Boolean, default: false },
  votes:       { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Question || mongoose.model("Question", questionSchema);
