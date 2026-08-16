import express from "express";
import { generateRoadmap } from "../services/geminiService.js";

const router = express.Router();

// 🔹 Curated Roadmap Templates for Explore page
const CURATED_TEMPLATES = [
  {
    technology: "Frontend Developer",
    goal: "Job-ready",
    experience: "Beginner",
    estimatedDuration: "10-12 weeks",
    topicCount: 24,
    difficulty: "Beginner",
    category: "Frontend",
    tagline: "Master HTML, CSS, JavaScript, React, Tailwind, and Modern State Management."
  },
  {
    technology: "Full Stack Engineer",
    goal: "Build Full Apps",
    experience: "Intermediate",
    estimatedDuration: "14-16 weeks",
    topicCount: 32,
    difficulty: "Intermediate",
    category: "Full Stack",
    tagline: "React, Node.js, Express, MongoDB, REST APIs, JWT Auth, and Cloud Deployment."
  },
  {
    technology: "Backend & System Design",
    goal: "Interview Prep",
    experience: "Intermediate",
    estimatedDuration: "8-10 weeks",
    topicCount: 20,
    difficulty: "Advanced",
    category: "Backend",
    tagline: "Node.js, Databases, Microservices, Caching, Load Balancing, and Scalability."
  },
  {
    technology: "DevOps & Cloud Engineer",
    goal: "Certification & Industry",
    experience: "Intermediate",
    estimatedDuration: "12 weeks",
    topicCount: 22,
    difficulty: "Intermediate",
    category: "DevOps",
    tagline: "Docker, Kubernetes, CI/CD Pipelines, AWS Fundamentals, and Infrastructure as Code."
  },
  {
    technology: "AI & Machine Learning",
    goal: "Build AI Products",
    experience: "Intermediate",
    estimatedDuration: "12-14 weeks",
    topicCount: 26,
    difficulty: "Advanced",
    category: "AI/ML",
    tagline: "Python, Data Analysis, Neural Networks, PyTorch, LLM APIs, and Vector Embeddings."
  },
  {
    technology: "Cybersecurity Analyst",
    goal: "Security Mastery",
    experience: "Beginner",
    estimatedDuration: "10 weeks",
    topicCount: 18,
    difficulty: "Intermediate",
    category: "Security",
    tagline: "Network Security, Cryptography, Vulnerability Assessment, and Penetration Testing."
  }
];

// 🔹 Get Explore Templates
router.get("/templates", (req, res) => {
  res.json(CURATED_TEMPLATES);
});

// 🔹 Generate AI Learning Pathway (Supports both simple & goal-based input)
router.post("/generate", async (req, res) => {
  const { technology, goal = "Mastery", experience = "Beginner", weeklyHours = 5, learningStyle = "Project-oriented" } = req.body;

  if (!technology) {
    return res.status(400).json({ error: "Technology is required" });
  }

  try {
    console.log(`Generating roadmap for ${technology} (Goal: ${goal}, Level: ${experience})`);
    const pathwayData = await generateRoadmap({
      technology,
      goal,
      experience,
      weeklyHours,
      learningStyle
    });

    res.json({ technology, pathway: pathwayData });
  } catch (error) {
    console.error("Roadmap generation error:", error.message);
    res.status(500).json({ error: error.message || "Failed to generate pathway" });
  }
});

export default router;