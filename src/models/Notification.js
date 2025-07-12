import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type:       {
    type: String,
    enum: ["answer", "comment", "mention", "reply"],
    required: true,
  },
  message:    { type: String, required: true },
  isRead:     { type: Boolean, default: false },
  link:       { type: String }, // Optional link to question/answer
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
