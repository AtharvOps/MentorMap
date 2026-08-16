import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
  role: { type: String, default: "learner" },
  
  // Learning Preferences
  preferences: {
    theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
    weeklyGoalHours: { type: Number, default: 5 },
    preferredLearningStyle: { type: String, default: "Project-oriented" },
    difficulty: { type: String, default: "Beginner" },
    sessionLengthMinutes: { type: Number, default: 30 }
  },

  // Stats & Gamification
  stats: {
    streakDays: { type: Number, default: 1 },
    lastActiveDate: { type: Date, default: Date.now },
    totalLearningMinutes: { type: Number, default: 0 },
    completedTopicsCount: { type: Number, default: 0 },
    quizzesCompletedCount: { type: Number, default: 0 },
    projectsCompletedCount: { type: Number, default: 0 },
    averageQuizScore: { type: Number, default: 0 }
  },

  pathways: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pathway" }]
}, { timestamps: true });

export default mongoose.model("User", userSchema);
