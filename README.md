# 🚀 MentorMap — AI-Powered Adaptive Learning Intelligence Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Author](https://img.shields.io/badge/Author-Atharv%20Patil-0e8544.svg)](#-author--developer)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20GFG%20UI-22c55e.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933.svg)](https://nodejs.org/)
[![AI Engine](https://img.shields.io/badge/AI%20Core-Google%20Gemini%20Flash-4285F4.svg)](https://ai.google.dev/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248.svg)](https://www.mongodb.com/)
[![D3 Engine](https://img.shields.io/badge/Visuals-D3.js%20Knowledge%20Graph-F9A03C.svg)](https://d3js.org/)

> **MentorMap 2.0** is an interactive, developer-focused **AI Learning Operating System**. It combines visual knowledge dependency graphs, Socratic 1-on-1 AI tutoring, 13-section deep editorial study notes, LeetCode-style 365-day consistency heatmaps, and a 5-round senior mock interview simulator into a unified, gamified platform.

---

## 🌟 Key Platform Features

### 🧠 1. Socratic AI Mentor & Explain-Back Diagnostics
- **1-on-1 Socratic Guidance**: Guides learners using thoughtful inquiries, mental models, and progressive hints rather than dumping raw answers.
- **Feynman Technique Evaluator**: Evaluates student conceptual explanations, detecting subtle misconceptions, prerequisite learning debt, and scoring depth of understanding.

### 🌳 2. Extended Multi-Level D3 Knowledge Graphs
- **Exhaustive Dependency Mapping**: Visualizes complete subject curricula across 4–6 comprehensive modules with granular subtopic leaf nodes.
- **Interactive D3 Engine**: Smooth mouse wheel zoom, pan, fullscreen mode, and progressive branch collapse/expand.

### 📖 3. 13-Section Deep Editorial Study Notes
- **Authentic GFG Developer Documentation**: Generates exhaustive 13-section technical guides complete with:
  - Executive Summaries & Architectural Mental Models
  - Step-by-Step Practical Code Examples
  - Real-World Physical Analogies
  - Industry Pitfalls & Anti-Patterns
  - Top Technical Interview Q&As and Cheat Sheets
- **Export & Clipboard**: Instant 1-click Markdown copy and PDF document export.

### 📊 4. LeetCode-Style 365-Day Activity Heatmap
- **52-Week Practice Consistency Grid**: Visualizes daily submissions and practice sessions with exact LeetCode green intensity levels (`#161b22`, `#9be9a8`, `#40c463`, `#30a14e`, `#216e39`).
- **Real-Time Consistency Metrics**: Active practice days, current streak 🔥, max streak ⚡, and interactive hover activity tooltips.

### 🧪 5. Interactive Coding & Debugging Lab
- **AI Code Reviewer**: Audits code across Correctness, Readability, and Time/Space Complexity ($O(N)$).
- **Broken Code Challenges**: Generates realistic production bugs with progressive hints and verified solutions.

### 💼 6. 5-Round Technical Mock Interview Simulator
- **Senior Principal Engineering Simulation**: Conversational 5-round interview assessing architecture, system design trade-offs, and concurrency.
- **Readiness Scoring**: Delivers overall hiring readiness score ($0-100\%$) and actionable feedback.

### 🎮 7. Gamification Engine & Level System
- **Level & XP Progress**: Earn XP through daily study minutes, completed topics, and passed quizzes.
- **Daily Quests**: Interactive daily challenges (*Take a Quiz +50 XP*, *Read Notes +30 XP*, *Solve Debug Lab +75 XP*).
- **Achievement Badges**: Unlock badges (*Streak Slayer 🔥*, *Quiz Ace 🎯*, *Bug Hunter 🐛*, *Code Architect 🏛️*, *Interview Ready 💼*).

### 🛡️ 8. Verified Proof-of-Skill Digital Passport
- **Shareable Public Credentials**: Cryptographically verifiable competency certificate showcasing topic mastery and problem-solving metrics.

---

## 🛠️ Technology Stack Architecture

```
┌────────────────────────────────────────────────────────┐
│               React 18 Frontend (Port 3000)            │
│  - GFG Design System & Tokens (Emerald Green Accent)   │
│  - D3.js Hierarchical Knowledge Graph Engine           │
│  - Lottie Vector Animations & React-Toastify           │
└───────────────────────────┬────────────────────────────┘
                            │ Axios API Proxy
┌───────────────────────────▼────────────────────────────┐
│              Express.js Backend (Port 5000)            │
│  - JWT Authentication & BCrypt Security                │
│  - Dynamic Multi-Model Rotation AI Engine              │
│  - Learning Twin & Activity Logging Service            │
└─────────────────────┬───────────────────┬──────────────┘
                      │                   │
         ┌────────────▼──────┐     ┌──────▼─────────────┐
         │   MongoDB Atlas   │     │  Google Gemini AI  │
         │  - User Profiles  │     │  - Fast Flash-Lite │
         │  - Roadmaps/Notes │     │  - Multi-Failover  │
         │  - 365-Day Logs   │     │  - Zero-Crash Mode │
         └───────────────────┘     └────────────────────┘
```

---

## ⚡ Getting Started & Local Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB Atlas Connection URI**
- **Google Gemini API Key** ([Get free key here](https://aistudio.google.com/))

---

### 2. Installation

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/AtharvOps/MentorMap.git
cd MentorMap

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### 3. Environment Configuration

#### Backend Configuration (`backend/.env`):
Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-flash-lite-latest
```

#### Frontend Configuration (`frontend/.env`):
Create a `.env` file in the `frontend/` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

### 4. Running the Application Locally

Open two terminal windows:

#### Terminal 1 — Backend:
```bash
cd backend
npm start
# Server running on http://localhost:5000
```

#### Terminal 2 — Frontend:
```bash
cd frontend
npm start
# Frontend running on http://localhost:3000
```

---

## 🧑‍💻 Author & Developer

**MentorMap 2.0** is designed and developed with ❤️ by **Atharv Patil**.

- **Lead Architect**: Atharv Patil
- **GitHub**: [@AtharvOps](https://github.com/AtharvOps)
- **Role**: Full-Stack Software Engineer & AI Systems Architect

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Atharv Patil

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```
