import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  content:   { type: String, required: true },
  author:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Either attached to a Question or an Answer
  question:  { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
  answer:    { type: mongoose.Schema.Types.ObjectId, ref: "Answer" },

  // This enables replies to other comments
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },

  createdAt: { type: Date, default: Date.now },
});

// Validation
commentSchema.pre("save", function (next) {
  if (!this.question && !this.answer && !this.parentComment) {
    return next(new Error("Comment must relate to a question, answer, or parent comment"));
  }
  next();
});

export default mongoose.models.Comment || mongoose.model("Comment", commentSchema);
