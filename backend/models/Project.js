import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    technology: { type: String, required: true },
    title: { type: String, required: true },
    tagline: { type: String, default: "" },
    summary: { type: String, default: "" },
    difficulty: { type: String, default: "Intermediate" },
    estimatedHours: { type: String, default: "6-8 hours" },
    techStack: [{ type: String }],
    coreRequirements: [{ type: String }],
    milestones: [
      {
        step: Number,
        title: String,
        tasks: [String],
        completed: { type: Boolean, default: false }
      }
    ],
    status: { type: String, enum: ["In Progress", "Submitted", "Evaluated", "Completed"], default: "In Progress" },
    submission: {
      repoUrl: String,
      liveUrl: String,
      codeOrNotes: String,
      submittedAt: Date
    },
    evaluation: {
      overallScore: Number, // 0 to 100
      architectureScore: Number,
      functionalityScore: Number,
      codeQualityScore: Number,
      testingScore: Number,
      documentationScore: Number,
      summary: String,
      keyHighlights: [String],
      criticalImprovements: [String],
      seniorEngineerVerdict: String,
      evaluatedAt: Date
    }
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
