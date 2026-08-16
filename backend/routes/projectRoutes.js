import express from "express";
import authMiddleware from "../middleware/auth.js";
import Project from "../models/Project.js";

const router = express.Router();

// 🔹 Get all projects for user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.json(projects || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// 🔹 Save a project mission
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { technology, title, tagline, summary, difficulty, estimatedHours, techStack, coreRequirements, milestones } = req.body;
    
    const project = new Project({
      userId: req.user.id,
      technology,
      title,
      tagline,
      summary,
      difficulty,
      estimatedHours,
      techStack,
      coreRequirements,
      milestones
    });

    await project.save();
    res.status(201).json({ message: "Project mission saved", project });
  } catch (error) {
    res.status(500).json({ error: "Failed to create project" });
  }
});

// 🔹 Update project milestones or submission
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { milestones, submission, evaluation, status } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { ...(milestones && { milestones }), ...(submission && { submission }), ...(evaluation && { evaluation }), ...(status && { status }) } },
      { new: true }
    );

    if (!project) return res.status(404).json({ error: "Project not found" });

    res.json({ message: "Project updated", project });
  } catch (error) {
    res.status(500).json({ error: "Failed to update project" });
  }
});

// 🔹 Delete project
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ error: "Project not found" });
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;
