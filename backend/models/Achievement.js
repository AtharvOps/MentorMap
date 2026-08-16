import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    key: { type: String, required: true }, // e.g. "first_step", "streak_7", "quiz_master", "project_builder"
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: "🏆" },
    category: { type: String, default: "General" },
    unlockedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

achievementSchema.index({ userId: 1, key: 1 }, { unique: true });

export default mongoose.model("Achievement", achievementSchema);
