import express from "express";
import authMiddleware from "../middleware/auth.js";
import QuizAttempt from "../models/QuizAttempt.js";
import { updateTopicMastery, recordActivity } from "../services/learningTwinService.js";

const router = express.Router();

// 🔹 Submit quiz attempt and update Learning Twin
router.post("/submit", authMiddleware, async (req, res) => {
  try {
    const {
      topic,
      courseId,
      sectionIndex,
      stepIndex,
      score,
      totalQuestions,
      correctAnswersCount,
      confidenceLevel,
      answers,
      detectedMisconceptions,
      technology
    } = req.body;

    const attempt = new QuizAttempt({
      userId: req.user.id,
      topic,
      courseId,
      sectionIndex,
      stepIndex,
      score,
      totalQuestions: totalQuestions || 5,
      correctAnswersCount: correctAnswersCount || 0,
      confidenceLevel: confidenceLevel || 3,
      answers: answers || [],
      detectedMisconceptions: detectedMisconceptions || []
    });

    await attempt.save();

    // Update Learning Twin mastery and calibration
    await updateTopicMastery(req.user.id, {
      topic,
      technology: technology || "",
      quizScore: score,
      confidence: confidenceLevel ? confidenceLevel * 20 : 60,
      misconceptions: detectedMisconceptions || []
    });

    // Record activity
    await recordActivity(req.user.id, { minutes: 15, isQuiz: true, topic });

    res.status(201).json({ message: "Quiz attempt recorded", attempt });
  } catch (error) {
    console.error("Quiz submission error:", error);
    res.status(500).json({ error: "Failed to submit quiz attempt" });
  }
});

// 🔹 Get quiz history
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const history = await QuizAttempt.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(history || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch quiz history" });
  }
});

export default router;
