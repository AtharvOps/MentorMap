import mongoose from "mongoose";

const learningTwinSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    
    // Topic mastery dictionary: { "React Hooks": { mastery: 85, confidence: 90, quizCount: 3, lastReviewedAt: Date, needsReview: false } }
    topics: {
      type: Map,
      of: new mongoose.Schema({
        technology: String,
        mastery: { type: Number, default: 0 }, // 0 to 100
        confidence: { type: Number, default: 0 }, // 0 to 100
        quizAccuracy: { type: Number, default: 0 }, // 0 to 100
        explainBackScore: { type: Number, default: 0 },
        lastPracticedAt: { type: Date, default: Date.now },
        needsReview: { type: Boolean, default: false },
        reviewDueDate: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        attemptsCount: { type: Number, default: 0 }
      }, { _id: false }),
      default: {}
    },

    // Detected Misconceptions: [{ topic: "useEffect", description: "Confusing render with effect", detectedAt: Date, resolved: false }]
    misconceptions: [
      {
        topic: String,
        description: String,
        detectedAt: { type: Date, default: Date.now },
        resolved: { type: Boolean, default: false },
        recommendedReview: String
      }
    ],

    // Missing Prerequisites (Learning Debt)
    learningDebt: [
      {
        prerequisite: String,
        blockingTopic: String,
        technology: String,
        severity: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
        createdAt: { type: Date, default: Date.now }
      }
    ],

    // Calibration: array of confidence vs actual scores for plotting calibration curve
    confidenceLogs: [
      {
        topic: String,
        confidence: Number,
        actualScore: Number,
        recordedAt: { type: Date, default: Date.now }
      }
    ],

    // Primary Weaknesses
    weakTopics: [{ type: String }],
    strongTopics: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model("LearningTwin", learningTwinSchema);
