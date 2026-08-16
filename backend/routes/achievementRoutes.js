import express from "express";
import authMiddleware from "../middleware/auth.js";
import Achievement from "../models/Achievement.js";

const router = express.Router();

// 🔹 Get user achievements
router.get("/", authMiddleware, async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.user.id }).sort({ unlockedAt: -1 });
    res.json(achievements || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch achievements" });
  }
});

export default router;
