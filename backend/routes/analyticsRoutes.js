import express from "express";
import authMiddleware from "../middleware/auth.js";
import ActivityLog from "../models/ActivityLog.js";
import LearningTwin from "../models/LearningTwin.js";
import User from "../models/User.js";
import Pathway from "../models/Pathway.js";
import QuizAttempt from "../models/QuizAttempt.js";
import Project from "../models/Project.js";
import Achievement from "../models/Achievement.js";

const router = express.Router();

// 🔹 Summary stats for user dashboard & analytics
router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const twin = await LearningTwin.findOne({ userId: req.user.id });
    const courses = await Pathway.find({ userId: req.user.id });
    const quizzes = await QuizAttempt.find({ userId: req.user.id });
    const projects = await Project.find({ userId: req.user.id });
    const achievements = await Achievement.find({ userId: req.user.id });

    // Calculate aggregate mastery
    let totalMastery = 0;
    let topicCount = 0;
    if (twin && twin.topics) {
      for (const [, data] of twin.topics.entries()) {
        totalMastery += data.mastery || 0;
        topicCount++;
      }
    }
    const overallMasteryScore = topicCount > 0 ? Math.round(totalMastery / topicCount) : 0;

    res.json({
      user: {
        name: user.name,
        email: user.email,
        stats: user.stats,
        preferences: user.preferences
      },
      overallMasteryScore,
      totalCourses: courses.length,
      totalQuizzes: quizzes.length,
      totalProjects: projects.length,
      achievementsCount: achievements.length,
      weakTopicsCount: twin?.weakTopics?.length || 0,
      strongTopicsCount: twin?.strongTopics?.length || 0,
      learningDebtCount: twin?.learningDebt?.length || 0
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics summary" });
  }
});

// 🔹 365-day Activity Heatmap
router.get("/heatmap", authMiddleware, async (req, res) => {
  try {
    const logs = await ActivityLog.find({ userId: req.user.id }).sort({ date: 1 });
    res.json(logs || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch heatmap data" });
  }
});

// 🔹 Verified Proof-of-Skill Passport
router.get("/passport", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const twin = await LearningTwin.findOne({ userId: req.user.id });
    const quizzes = await QuizAttempt.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(10);
    const projects = await Project.find({ userId: req.user.id, status: "Evaluated" });
    const achievements = await Achievement.find({ userId: req.user.id });

    const verifiedSkills = [];
    if (twin && twin.topics) {
      for (const [topicName, data] of twin.topics.entries()) {
        if (data.mastery >= 65) {
          verifiedSkills.push({
            skill: topicName,
            technology: data.technology || "Core",
            mastery: data.mastery,
            quizzesCount: data.attemptsCount,
            lastVerifiedAt: data.lastPracticedAt
          });
        }
      }
    }

    res.json({
      passportId: `SKILL-${user._id.toString().substring(18).toUpperCase()}`,
      userName: user.name,
      verifiedSkills,
      totalLearningHours: Math.round((user.stats?.totalLearningMinutes || 0) / 60),
      quizzesPassed: quizzes.filter(q => q.score >= 70).length,
      projectsEvaluated: projects.length,
      badges: achievements
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch skill passport" });
  }
});

// 🔹 Public shareable passport
router.get("/public/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("name stats createdAt");
    if (!user) return res.status(404).json({ error: "Profile not found" });

    const twin = await LearningTwin.findOne({ userId: req.params.userId });
    const projects = await Project.find({ userId: req.params.userId, status: "Evaluated" });
    const achievements = await Achievement.find({ userId: req.params.userId });

    const verifiedSkills = [];
    if (twin && twin.topics) {
      for (const [topicName, data] of twin.topics.entries()) {
        if (data.mastery >= 70) {
          verifiedSkills.push({
            skill: topicName,
            mastery: data.mastery,
            technology: data.technology
          });
        }
      }
    }

    res.json({
      userName: user.name,
      joinedDate: user.createdAt,
      stats: user.stats,
      verifiedSkills,
      projectsCount: projects.length,
      achievements
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch public profile" });
  }
});

export default router;
