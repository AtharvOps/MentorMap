import express from "express";
import { authMiddleware, optionalAuth } from "../middleware/auth.js";
import {
  generateRoadmap,
  generateNotes,
  generateQuiz,
  generateTutorResponse,
  evaluateExplanation,
  reviewCode,
  generateDebugChallenge,
  generateProjectMission,
  evaluateProject,
  generateInterviewQuestion,
  evaluateInterviewResponse,
  simulateInterviewTurn
} from "../services/geminiService.js";
import { updateTopicMastery, recordActivity } from "../services/learningTwinService.js";

const router = express.Router();

// 🔹 1. AI Study Notes Generation
router.post("/notes", async (req, res) => {
  try {
    const { topic, technology, detailLevel } = req.body;
    if (!topic) return res.status(400).json({ error: "Topic is required" });

    const notesMarkdown = await generateNotes({ topic, technology, detailLevel });
    res.json({ topic, content: notesMarkdown });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to generate notes" });
  }
});

// 🔹 2. AI Quiz Generation
router.post("/quiz", async (req, res) => {
  try {
    const { topic, questionCount = 5, difficulty = "Intermediate" } = req.body;
    if (!topic) return res.status(400).json({ error: "Topic is required" });

    const questions = await generateQuiz({ topic, questionCount, difficulty });
    res.json({ topic, questions });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to generate quiz" });
  }
});

// 🔹 3. Socratic AI Tutor Chat
router.post("/tutor", async (req, res) => {
  try {
    const { message, conversationHistory, currentTopic } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const reply = await generateTutorResponse({ message, conversationHistory, currentTopic });
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to get tutor response" });
  }
});

// 🔹 4. Explain-Back Evaluator
router.post("/explain", optionalAuth, async (req, res) => {
  try {
    const { topic, studentExplanation, explanation, technology } = req.body;
    const finalExplanation = studentExplanation || explanation;
    if (!topic || !finalExplanation) {
      return res.status(400).json({ error: "Topic and explanation are required" });
    }

    const evaluation = await evaluateExplanation({ topic, studentExplanation: finalExplanation });
    
    // If user is authenticated, sync evaluation to Learning Twin
    if (req.user?.id) {
      try {
        await updateTopicMastery(req.user.id, {
          topic,
          technology,
          explainScore: evaluation.understandingScore || evaluation.score,
          misconceptions: evaluation.misconceptions || []
        });
        await recordActivity(req.user.id, { minutes: 10, topic });
      } catch (twinErr) {
        console.warn("Learning twin sync failed for explain:", twinErr.message);
      }
    }

    res.json({ evaluation });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to evaluate explanation" });
  }
});

// 🔹 5. AI Code Reviewer
router.post("/code-review", async (req, res) => {
  try {
    const { code, language, problemContext } = req.body;
    if (!code) return res.status(400).json({ error: "Code snippet is required" });

    const review = await reviewCode({ code, language, problemContext });
    res.json({ review });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to review code" });
  }
});

// 🔹 6. Debug Challenge Generator
router.post("/debug-challenge", async (req, res) => {
  try {
    const { topic, difficulty } = req.body;
    const challenge = await generateDebugChallenge({ topic: topic || "JavaScript React", difficulty });
    res.json({ challenge });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to generate debug challenge" });
  }
});

// 🔹 7. Project Mission Generator & Evaluator
router.post("/project/generate", async (req, res) => {
  try {
    const { technology, masteredSkills, difficulty } = req.body;
    const project = await generateProjectMission({ technology: technology || "Full Stack", masteredSkills, difficulty });
    res.json({ project });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to generate project mission" });
  }
});

router.post("/project/evaluate", authMiddleware, async (req, res) => {
  try {
    const { projectTitle, requirements, codeOrRepo, description } = req.body;
    const evaluation = await evaluateProject({ projectTitle, requirements, codeOrRepo, description });
    
    await recordActivity(req.user.id, { minutes: 45, isProject: true });

    res.json({ evaluation });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to evaluate project" });
  }
});

// 🔹 8. Technical Mock Interview Simulator
router.post("/interview/turn", async (req, res) => {
  try {
    const { role, topic, history, userAnswer, turnCount } = req.body;
    const response = await simulateInterviewTurn({ role, topic, history, userAnswer, turnCount });
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to simulate interview turn" });
  }
});

router.post("/interview/question", async (req, res) => {
  try {
    const { role, seniority, round, previousQuestions } = req.body;
    const question = await generateInterviewQuestion({ role, seniority, round, previousQuestions });
    res.json({ question });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to generate interview question" });
  }
});

router.post("/interview/evaluate", authMiddleware, async (req, res) => {
  try {
    const { role, question, answer } = req.body;
    const evaluation = await evaluateInterviewResponse({ role, question, answer });
    
    await recordActivity(req.user.id, { minutes: 15 });

    res.json({ evaluation });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to evaluate interview answer" });
  }
});

export default router;
