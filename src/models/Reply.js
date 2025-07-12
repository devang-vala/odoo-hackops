import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
  content:  { type: String, required: true }, // Rich text HTML
  author:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  answer:   { type: mongoose.Schema.Types.ObjectId, ref: "Answer", required: true },
}, { timestamps: true });

export default mongoose.models.Reply || mongoose.model("Reply", replySchema);
