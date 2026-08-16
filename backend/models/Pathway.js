import mongoose from "mongoose";

const pathwaySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    technology: { type: String, required: true },
    goal: { type: String, default: "Mastery" },
    experience: { type: String, default: "Beginner" },
    estimatedDuration: { type: String, default: "4-6 weeks" },
    estimatedHours: { type: Number, default: 40 },
    difficulty: { type: String, default: "Beginner" },
    description: { type: String, default: "" },
    prerequisites: { type: [String], default: [] },
    
    // Supports both old tree structure and new stages structure
    pathway: { type: mongoose.Schema.Types.Mixed, required: true },
    
    progress: { type: Number, default: 0 }, // 0 to 100
    masteryScore: { type: Number, default: 0 }, // 0 to 100 calculated from tests & projects
    completedSteps: { type: [String], default: [] }, // Array of step IDs e.g. ["0-0", "stage-1-topic-1"]
    
    // Status per topic for adaptive graph: { "topicId": "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED" | "NEEDS_REVIEW" | "MASTERED" }
    topicStatuses: { type: Map, of: String, default: {} },
    
    // Notes or tags
    tags: { type: [String], default: [] },
    isArchived: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Pathway", pathwaySchema);
