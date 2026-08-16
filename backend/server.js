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

const JWT_SECRET = process.env.JWT_SECRET || "supersecret_mentormap_jwt_key_2025";

// 🔹 CORS Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept", "X-Requested-With"]
  })
);
app.options("*", cors());

// 🔹 MongoDB Connection
const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (mongoURI) {
  mongoose
    .connect(mongoURI)
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch((err) => console.error("MongoDB connection error:", err));
} else {
  console.warn("⚠️ MONGO_URI not set yet in environment variables.");
}

// ==========================
// 🔹 AUTHENTICATION ROUTES 🔹
// ==========================

// Helper to format user response safely
const formatUserResponse = (userDoc) => {
  const obj = userDoc.toObject ? userDoc.toObject() : userDoc;
  const idStr = (obj._id || obj.id || "").toString();
  return {
    id: idStr,
    _id: idStr,
    name: obj.name || "",
    email: obj.email || "",
    avatar: obj.avatar || "",
    role: obj.role || "learner",
    stats: obj.stats || {},
    preferences: obj.preferences || {}
  };
};

// ✅ User Signup
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields (name, email, password) are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword
    });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id.toString() }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: formatUserResponse(newUser)
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Internal server error during registration", error: error.message });
  }
});

// ✅ User Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Login successful",
      token,
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal server error during login", error: error.message });
  }
});

// ✅ Get User Profile (Protected)
app.get("/api/user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(formatUserResponse(user));
  } catch (error) {
    console.error("Fetch user error:", error);
    res.status(500).json({ message: "Server error fetching user profile" });
  }
});

// ✅ Update User Preferences & Profile
app.put("/api/user/preferences", authMiddleware, async (req, res) => {
  try {
    const { preferences, name, avatar, weeklyTargetHours, preferredLearningStyle } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    const mergedPrefs = { ...(user.preferences?.toObject ? user.preferences.toObject() : user.preferences) };
    if (preferences) Object.assign(mergedPrefs, preferences);
    if (weeklyTargetHours !== undefined) mergedPrefs.weeklyGoalHours = Number(weeklyTargetHours);
    if (preferredLearningStyle !== undefined) mergedPrefs.preferredLearningStyle = preferredLearningStyle;

    user.preferences = mergedPrefs;
    await user.save();

    res.json({ message: "Profile preferences updated", user: formatUserResponse(user) });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({ message: "Failed to update profile preferences", error: error.message });
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
  app.listen(PORT, "0.0.0.0", () => console.log(`🚀 MentorMap 2.0 Server running on port ${PORT}`));
}

export default app;
