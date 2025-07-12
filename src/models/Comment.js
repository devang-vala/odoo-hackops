import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  content:   { type: String, required: true },
  author:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Either attached to a Question or an Answer
  question:  { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
  answer:    { type: mongoose.Schema.Types.ObjectId, ref: "Answer" },

  createdAt: { type: Date, default: Date.now },
});

// Validation
commentSchema.pre("save", function (next) {
  if (!this.question && !this.answer) {
    return next(new Error("Comment must relate to a question or answer"));
  }
  next();
});

export default mongoose.models.Comment || mongoose.model("Comment", commentSchema);
