import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Pathway" },
    sectionIndex: Number,
    stepIndex: Number,
    score: { type: Number, required: true }, // percentage 0 to 100
    totalQuestions: { type: Number, default: 5 },
    correctAnswersCount: { type: Number, default: 0 },
    confidenceLevel: { type: Number, default: 3 }, // 1 to 5
    answers: [
      {
        question: String,
        selectedAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean,
        explanation: String,
        misconceptionNote: String
      }
    ],
    detectedMisconceptions: [String]
  },
  { timestamps: true }
);

export default mongoose.model("QuizAttempt", quizAttemptSchema);
