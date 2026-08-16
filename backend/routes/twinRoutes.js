import express from "express";
import authMiddleware from "../middleware/auth.js";
import LearningTwin from "../models/LearningTwin.js";
import { getSmartNextAction } from "../services/recommendationService.js";
import { recordActivity } from "../services/learningTwinService.js";

const router = express.Router();

// 🔹 Get User's Learning Twin profile
router.get("/", authMiddleware, async (req, res) => {
  try {
    let twin = await LearningTwin.findOne({ userId: req.user.id });
    if (!twin) {
      twin = new LearningTwin({ userId: req.user.id, topics: new Map() });
      await twin.save();
    }

    // Convert topics map to plain object for client consumption
    const topicsObj = {};
    if (twin.topics) {
      for (const [key, value] of twin.topics.entries()) {
        topicsObj[key] = value;
      }
    }

    res.json({
      ...twin.toObject(),
      topics: topicsObj
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Learning Twin profile" });
  }
});

// 🔹 Get Smart Next Action
router.get("/next-action", authMiddleware, async (req, res) => {
  try {
    const action = await getSmartNextAction(req.user.id);
    res.json(action);
  } catch (error) {
    res.status(500).json({ error: "Failed to get smart next action" });
  }
});

// 🔹 Log learning activity
router.post("/activity", authMiddleware, async (req, res) => {
  try {
    const { minutes, topic, isQuiz, isNote, isProject } = req.body;
    const log = await recordActivity(req.user.id, { minutes, topic, isQuiz, isNote, isProject });
    res.json({ success: true, log });
  } catch (error) {
    res.status(500).json({ error: "Failed to log activity" });
  }
});

// 🔹 Update learning preferences
router.put("/preferences", authMiddleware, async (req, res) => {
  try {
    const { weeklyTargetHours, preferredLearningStyle, preferences } = req.body;
    const User = (await import("../models/User.js")).default;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const currentPrefs = user.preferences?.toObject ? user.preferences.toObject() : (user.preferences || {});
    if (preferences) Object.assign(currentPrefs, preferences);
    if (weeklyTargetHours !== undefined) currentPrefs.weeklyGoalHours = Number(weeklyTargetHours);
    if (preferredLearningStyle !== undefined) currentPrefs.preferredLearningStyle = preferredLearningStyle;

    user.preferences = currentPrefs;
    await user.save();

    res.json({ message: "Preferences updated", preferences: user.preferences });
  } catch (error) {
    console.error("Twin preferences update error:", error);
    res.status(500).json({ error: "Failed to update preferences" });
  }
});

export default router;
