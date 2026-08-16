import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // Format "YYYY-MM-DD"
    minutesLearned: { type: Number, default: 0 },
    actionsCount: { type: Number, default: 1 },
    topicsCompleted: [{ type: String }],
    quizzesAttempted: { type: Number, default: 0 },
    notesGenerated: { type: Number, default: 0 },
    projectsWorkedOn: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Unique compound index on user + date
activityLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("ActivityLog", activityLogSchema);
