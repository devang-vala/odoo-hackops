import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["guest", "user", "admin"],
    default: "user",
  },
  notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Notification" }],
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", userSchema);
