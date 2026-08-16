import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import dns from "dns";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure DNS for MongoDB Atlas resolution
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Import Routes
import pathwayRoutes from "./routes/pathwayRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import twinRoutes from "./routes/twinRoutes.js";
import notesRoutes from "./routes/notesRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import achievementRoutes from "./routes/achievementRoutes.js";

// Models & Middleware
import User from "./models/User.js";
import authMiddleware from "./middleware/auth.js";

const app = express();

// 🔹 Middleware
app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://learning-pathway-project-1.onrender.com",
      "https://learning-pathway-project.vercel.app"
    ],
    credentials: true,
  })
);

// 🔹 MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ==========================
// 🔹 AUTHENTICATION ROUTES 🔹
// ==========================

// ✅ User Signup
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email }
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ User Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email?.toLowerCase()?.trim() });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, stats: user.stats, preferences: user.preferences }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Get User Profile (Protected)
app.get("/api/user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update User Preferences & Profile
app.put("/api/user/preferences", authMiddleware, async (req, res) => {
  try {
    const { preferences, name, avatar } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (preferences) {
      user.preferences = { ...user.preferences.toObject(), ...preferences };
    }

    await user.save();
    res.json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile preferences" });
  }
});

// ===========================
// 🔹 API ROUTERS MOUNTING 🔹
// ===========================

app.use("/api/pathways", pathwayRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/twin", twinRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/achievements", achievementRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "MentorMap 2.0 API", time: new Date() });
});

// Serve frontend static build files if available
const frontendBuildPath = path.join(__dirname, "../frontend/build");
app.use(express.static(frontendBuildPath));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }
  res.sendFile(path.join(frontendBuildPath, "index.html"), (err) => {
    if (err) {
      res.redirect("/explore");
    }
  });
});

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`🚀 MentorMap 2.0 Server running on port ${PORT}`));
}

export default app;
