import express from "express";
import Pathway from "../models/Pathway.js";
import authMiddleware from "../middleware/auth.js";
import { recordActivity } from "../services/learningTwinService.js";

const router = express.Router();

// 🔹 Save a Pathway
router.post("/save", authMiddleware, async (req, res) => {
  try {
    const { technology, pathway, goal, experience, estimatedDuration, difficulty, description } = req.body;

    const newPathway = new Pathway({
      userId: req.user.id,
      technology,
      pathway,
      goal: goal || pathway?.goal || "Mastery",
      experience: experience || pathway?.experience || "Beginner",
      estimatedDuration: estimatedDuration || pathway?.estimatedDuration || "4-6 weeks",
      difficulty: difficulty || pathway?.difficulty || "Beginner",
      description: description || pathway?.description || ""
    });

    await newPathway.save();
    await recordActivity(req.user.id, { minutes: 15 });

    res.status(201).json({ message: "Pathway saved successfully", pathway: newPathway });
  } catch (error) {
    console.error("Failed to save pathway:", error);
    res.status(500).json({ error: "Failed to save pathway" });
  }
});

// 🔹 Get all Pathways for a User
router.get("/", authMiddleware, async (req, res) => {
  try {
    const pathways = await Pathway.find({ userId: req.user.id, isArchived: false }).sort({ updatedAt: -1 });
    res.json(pathways || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pathways" });
  }
});

// 🔹 Get single Pathway by ID
router.get("/:id", async (req, res) => {
  try {
    const pathway = await Pathway.findById(req.params.id);
    if (!pathway) {
      return res.status(404).json({ message: "Pathway not found" });
    }
    res.json(pathway);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pathway" });
  }
});

// 🔹 Update Progress & Completed Steps
router.put("/:pathwayId/progress", authMiddleware, async (req, res) => {
  try {
    const { pathwayId } = req.params;
    const { progress, completedSteps } = req.body;

    const updated = await Pathway.findOneAndUpdate(
      { _id: pathwayId, userId: req.user.id },
      {
        $set: {
          progress: Number(progress) || 0,
          ...(completedSteps && { completedSteps })
        }
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Pathway not found" });

    await recordActivity(req.user.id, { minutes: 10 });

    res.json({ message: "Progress updated", pathway: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to update progress" });
  }
});

// 🔹 Complete step endpoint (from Quiz or direct checklist)
router.post("/:courseId/complete-step", authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { sectionIndex, stepIndex, stepId, quizScore } = req.body;

    const targetStepId = stepId || `${sectionIndex}-${stepIndex}`;

    const pathway = await Pathway.findOne({ _id: courseId, userId: req.user.id });
    if (!pathway) {
      return res.status(404).json({ message: "Pathway not found" });
    }

    if (!pathway.completedSteps.includes(targetStepId)) {
      pathway.completedSteps.push(targetStepId);
      
      // Calculate progress percentage
      const raw = Array.isArray(pathway.pathway) ? pathway.pathway : (pathway.pathway?.children || []);
      let total = 0;
      raw.forEach(s => {
        if (s.children && s.children.length > 0) total += s.children.length;
        else if (s.name) total += 1;
      });
      if (total > 0) {
        pathway.progress = Math.min(100, Math.round((pathway.completedSteps.length / total) * 100));
      }
      await pathway.save();
    }

    await recordActivity(req.user.id, { minutes: 15, isQuiz: !!quizScore });

    res.json({ message: "Step completed successfully", pathway });
  } catch (error) {
    res.status(500).json({ error: "Failed to complete step" });
  }
});

// 🔹 Delete a Pathway
router.delete("/:pathwayId", authMiddleware, async (req, res) => {
  try {
    const deleted = await Pathway.findOneAndDelete({ _id: req.params.id || req.params.pathwayId, userId: req.user.id });
    if (!deleted) return res.status(404).json({ message: "Pathway not found" });

    res.json({ message: "Pathway deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete pathway" });
  }
});

export default router;