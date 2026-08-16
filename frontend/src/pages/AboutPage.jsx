import React from "react";
import Lottie from "lottie-react";
import teamAnimation from "../assets/team-animation.json";
import { 
  Sparkles, Code2, BrainCircuit, Terminal, 
  Layers, ShieldCheck, Award, Zap, Compass 
} from "lucide-react";
import { Link } from "react-router-dom";

const AboutPage = () => {
  const techStack = [
    { name: "React 18 & Vite", category: "Frontend Engine", desc: "Component architecture with fast virtual DOM and state management" },
    { name: "Node.js & Express", category: "Backend Microservices", desc: "High-throughput asynchronous REST API & AI proxy architecture" },
    { name: "MongoDB Atlas", category: "Database & Models", desc: "Scalable document database with user learning models and activity logs" },
    { name: "Google Gemini AI", category: "Intelligence Core", desc: "Multi-model reasoning for roadmaps, 13-section notes, quizzes, and interviews" },
    { name: "D3.js Data Engine", category: "Knowledge Graph", desc: "Interactive hierarchical zoom/pan visual learning dependency graphs" },
    { name: "Lottie React", category: "Interactive Visuals", desc: "Silky 60fps vector animations and engaging gamified experiences" }
  ];

  const features = [
    { icon: <Compass size={22} color="var(--primary)" />, title: "Goal-Driven Syllabi", desc: "Adaptive learning pathways tailored by seniority, weekly hours, and target goals." },
    { icon: <Layers size={22} color="var(--primary)" />, title: "D3 Knowledge Graphs", desc: "Exhaustive multi-branch concept graphs mapping prerequisites and deep subtopics." },
    { icon: <BrainCircuit size={22} color="var(--primary)" />, title: "Socratic AI Tutor", desc: "Guiding mentor using inquiries and mental models instead of dumping raw answers." },
    { icon: <Terminal size={22} color="var(--primary)" />, title: "Debug & Coding Lab", desc: "Real-world debugging scenarios with progressive hints and automated rubric review." },
    { icon: <Award size={22} color="var(--primary)" />, title: "LeetCode Heatmap & XP", desc: "365-day practice consistency tracker with leveling, daily quests, and badges." },
    { icon: <ShieldCheck size={22} color="var(--primary)" />, title: "Skill Passport", desc: "Cryptographically verifiable mastery scores and public shareable credentials." }
  ];

  return (
    <div style={{ maxWidth: "1160px", margin: "0 auto", paddingBottom: "80px", display: "flex", flexDirection: "column", gap: "40px" }}>
      {/* =======================
          HERO BANNER WITH LOTTIE ANIMATION
          ======================= */}
      <div className="saas-card" style={{ padding: "40px 48px", overflow: "hidden", display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "32px", alignItems: "center" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "var(--primary-soft)", padding: "6px 14px", borderRadius: "var(--radius-full)", border: "1px solid var(--primary-border)", marginBottom: "16px" }}>
            <Sparkles size={16} color="var(--primary)" />
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--primary)" }}>ABOUT MENTORMAP 2.0</span>
          </div>

          <h1 style={{ fontSize: "2.4rem", fontWeight: 800, lineHeight: 1.25, marginBottom: "16px", color: "var(--text-primary)" }}>
            Next-Generation AI Learning Operating System
          </h1>

          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "24px" }}>
            MentorMap transforms developer education from static tutorials into an intelligent, adaptive learning ecosystem that diagnoses knowledge gaps, calibrates conceptual confidence, and guides learners from beginner to senior architect.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link to="/explore" className="btn-gfg-primary" style={{ padding: "12px 24px", fontSize: "0.96rem" }}>
              <Compass size={18} /> Explore Curriculum
            </Link>
            <Link to="/dashboard" className="btn-outline-gfg" style={{ padding: "12px 24px", fontSize: "0.96rem" }}>
              My Dashboard
            </Link>
          </div>
        </div>

        {/* Lottie Vector Team Animation */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", maxHeight: "360px" }}>
          <Lottie 
            animationData={teamAnimation} 
            loop={true} 
            style={{ width: "100%", maxHeight: "360px" }}
          />
        </div>
      </div>

      {/* =======================
          DEVELOPER SPOTLIGHT: ATHARV PATIL
          ======================= */}
      <div className="saas-card" style={{ padding: "36px 44px", borderLeft: "6px solid var(--primary)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "28px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Creator Avatar & Badge */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: "96px",
                height: "96px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--primary-soft)",
                color: "var(--primary)",
                fontWeight: 900,
                fontSize: "2.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "3px solid var(--primary)",
                boxShadow: "0 8px 24px rgba(14, 133, 68, 0.2)"
              }}
            >
              AP
            </div>
            <div style={{ position: "absolute", bottom: "-4px", right: "-4px", backgroundColor: "var(--primary)", color: "#fff", borderRadius: "var(--radius-full)", padding: "4px", display: "flex" }}>
              <Zap size={14} />
            </div>
          </div>

          {/* Developer Details */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
              <h2 style={{ fontSize: "1.65rem", fontWeight: 800, margin: 0 }}>Atharv Patil</h2>
              <span className="badge-soft-primary">LEAD ARCHITECT & DEVELOPER</span>
            </div>

            <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", fontWeight: 600, marginBottom: "12px" }}>
              Creator & Principal Full-Stack Engineer of MentorMap
            </p>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.98rem", lineHeight: 1.65, maxWidth: "720px", margin: 0 }}>
              "Built with passion to empower developers worldwide with structured visual roadmaps, deep editorial notes, and Socratic AI mentorship. MentorMap bridges the gap between theoretical knowledge and real-world engineering excellence."
            </p>
          </div>

          {/* Developer Links & Badges */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "160px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 700 }}>
              <Code2 size={16} color="var(--primary)" /> 100% Custom Built
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 700 }}>
              <BrainCircuit size={16} color="var(--primary)" /> AI-Powered
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 700 }}>
              <Award size={16} color="var(--primary)" /> 2026 Production Ready
            </div>
          </div>
        </div>
      </div>

      {/* =======================
          PLATFORM CAPABILITIES
          ======================= */}
      <div>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h2 style={{ fontSize: "1.85rem", fontWeight: 800, marginBottom: "8px" }}>Complete AI Learning Architecture</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.98rem", maxWidth: "600px", margin: "0 auto" }}>
            Designed with high content density, developer-focused ergonomics, and gamified progress mechanics.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
          {features.map((f, i) => (
            <div key={i} className="saas-card" style={{ padding: "26px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ padding: "10px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--primary-soft)", display: "flex" }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0 }}>{f.title}</h3>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* =======================
          TECHNICAL INFRASTRUCTURE
          ======================= */}
      <div className="saas-card" style={{ padding: "32px 36px" }}>
        <h2 style={{ fontSize: "1.45rem", fontWeight: 800, marginBottom: "20px" }}>Underlying Technology Stack</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {techStack.map((tech, idx) => (
            <div key={idx} style={{ padding: "16px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--bg-input)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "0.76rem", color: "var(--primary)", fontWeight: 800, textTransform: "uppercase", marginBottom: "4px" }}>
                {tech.category}
              </div>
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
                {tech.name}
              </div>
              <div style={{ fontSize: "0.86rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                {tech.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
