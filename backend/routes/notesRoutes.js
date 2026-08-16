import express from "express";
import authMiddleware from "../middleware/auth.js";
import Note from "../models/Note.js";
import { recordActivity } from "../services/learningTwinService.js";

const router = express.Router();

// 🔹 Get all saved notes for user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.json(notes || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// 🔹 Save a study note
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { topic, technology, content, courseId, tags } = req.body;
    if (!topic || !content) {
      return res.status(400).json({ error: "Topic and content are required" });
    }

    const note = new Note({
      userId: req.user.id,
      topic,
      technology: technology || "",
      content,
      courseId,
      tags: tags || [technology || "General"]
    });

    await note.save();
    await recordActivity(req.user.id, { minutes: 10, isNote: true, topic });

    res.status(201).json({ message: "Note saved successfully", note });
  } catch (error) {
    res.status(500).json({ error: "Failed to save note" });
  }
});

// 🔹 Toggle favorite note
router.put("/:id/favorite", authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) return res.status(404).json({ error: "Note not found" });

    note.isFavorite = !note.isFavorite;
    await note.save();

    res.json({ message: "Favorite toggled", note });
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle favorite" });
  }
});

// 🔹 Delete note
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ error: "Note not found" });

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete note" });
  }
});

export default router;
