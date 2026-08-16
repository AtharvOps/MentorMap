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

export default router;
