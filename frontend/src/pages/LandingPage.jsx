import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, BookOpen, Layers, CheckCircle, Code2, 
  Search, Star, Users, Clock, ShieldCheck, Terminal 
} from "lucide-react";
import { generatePathway, saveCourse } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import logo from "../assets/logo.png";

const LandingPage = () => {
  const [tech, setTech] = useState("");
  const [goal, setGoal] = useState("Become job-ready");
  const [experience, setExperience] = useState("Beginner");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const popularCourses = [
    {
      title: "Data Structures & Algorithms Mastery",
      category: "Core Computer Science",
      difficulty: "Intermediate",
      duration: "40h",
      modules: 16,
      rating: 4.9,
      students: "18.4k",
      description: "Arrays, Linked Lists, Trees, Dynamic Programming, Graphs, and FAANG interview patterns."
    },
    {
      title: "Full Stack Web Development",
      category: "Web Development",
      difficulty: "Beginner",
      duration: "52h",
      modules: 22,
      rating: 4.8,
      students: "24.1k",
      description: "React 18, Node.js, Express, MongoDB, REST APIs, Authentication, and Cloud Deployment."
    },
    {
      title: "System Design & Architecture",
      category: "System Design",
      difficulty: "Advanced",
      duration: "28h",
      modules: 12,
      rating: 4.9,
      students: "12.8k",
      description: "Scalability, Microservices, Caching, Load Balancing, Database Sharding, and Distributed Systems."
    },
    {
      title: "Backend Engineering with Python & FastAPI",
      category: "Backend",
      difficulty: "Intermediate",
      duration: "34h",
      modules: 14,
      rating: 4.8,
      students: "9.6k",
      description: "Async Python, Database ORMs, Redis caching, Celery queues, Docker, and API Security."
    }
  ];

  const techSuggestions = [
    "Data Structures & Algorithms", "React", "Python", "System Design", 
    "Java", "C++", "SQL & DBMS", "DevOps & Docker", "Machine Learning"
  ];

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!tech.trim()) {
      toast.warning("Please enter a subject or technology!");
      return;
    }

    setLoading(true);
    try {
      const response = await generatePathway({
        technology: tech.trim(),
        goal,
        experience
      });

      if (isAuthenticated) {
        try {
          const saveRes = await saveCourse({
            technology: tech.trim(),
            pathway: response.data.pathway,
            goal,
            experience,
            difficulty: experience
          });
          toast.success("Curriculum generated and added to your dashboard!");
          navigate(`/courses/${saveRes.data.pathway._id}`);
          return;
        } catch (_) {}
      }

      navigate("/explore", { state: { generatedPathway: response.data } });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to generate learning pathway.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: "60px", display: "flex", flexDirection: "column", gap: "36px" }}>
      {/* ==========================
          HERO SEARCH & CURRICULUM GENERATOR
          ========================== */}
      <section style={{ textAlign: "center", padding: "24px 12px 32px", maxWidth: "920px", margin: "0 auto", width: "100%" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "4px 12px", backgroundColor: "var(--primary-soft)", borderRadius: "var(--radius-sm)", color: "var(--primary)", fontWeight: 700, fontSize: "0.8rem", marginBottom: "16px", border: "1px solid var(--primary-border)" }}>
          <img src={logo} alt="Logo" style={{ width: "18px", height: "18px", objectFit: "contain" }} />
          <span>STRUCTURED DEVELOPER LEARNING PLATFORM</span>
        </div>

        <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 800, lineHeight: 1.2, marginBottom: "12px", color: "var(--text-primary)" }}>
          Master Engineering Skills with <span style={{ color: "var(--primary)" }}>Structured Curriculum</span>
        </h1>

        <p style={{ fontSize: "1rem", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: "680px", margin: "0 auto 28px" }}>
          Explore structured tech pathways, practice topic-wise quizzes with misconception diagnostics, study editorial notes, and build verified engineering skills.
        </p>

        {/* Search & Generator Box */}
        <div className="saas-card" style={{ maxWidth: "760px", margin: "0 auto", textAlign: "left", padding: "24px" }}>
          <form onSubmit={handleGenerate}>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px" }}>
                WHAT SUBJECT OR TECHNOLOGY DO YOU WANT TO MASTER?
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border)", backgroundColor: "var(--bg-input)" }}>
                <Search size={18} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="e.g. Data Structures & Algorithms, React, System Design, Python, Docker..."
                  value={tech}
                  onChange={(e) => setTech(e.target.value)}
                  style={{ width: "100%", background: "none", border: "none", outline: "none", color: "var(--text-primary)", fontSize: "0.95rem", fontWeight: 500 }}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "4px" }}>
                  PRIMARY GOAL
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)", outline: "none", fontSize: "0.86rem" }}
                >
                  <option value="Become job-ready">Become job-ready (Industry Skills)</option>
                  <option value="Prepare for interviews">Interview Preparation (DSA & Core)</option>
                  <option value="Build a real-world project">Build a Real-World Application</option>
                  <option value="College exams & fundamentals">College Exams & Foundations</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "4px" }}>
                  CURRENT LEVEL
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)", outline: "none", fontSize: "0.86rem" }}
                >
                  <option value="Beginner">Beginner (Foundations & Syntax)</option>
                  <option value="Intermediate">Intermediate (Practice & Patterns)</option>
                  <option value="Advanced">Advanced (Architecture & Optimization)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gfg-primary"
              style={{ width: "100%", padding: "11px", justifyContent: "center", fontSize: "0.92rem" }}
            >
              {loading ? (
                <span>Building Structured Pathway...</span>
              ) : (
                <>
                  <BookOpen size={16} />
                  <span>Generate Learning Pathway</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Suggestion Chips */}
          <div style={{ marginTop: "14px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontWeight: 700 }}>Trending:</span>
            {techSuggestions.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTech(t)}
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "3px 8px",
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  fontWeight: 500
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================
          FEATURED COURSE TRACKS (GFG CARDS)
          ========================== */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800 }}>Featured Developer Tracks</h2>
            <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", margin: 0 }}>
              Curated career-focused roadmaps with step-by-step syllabus and topic checks.
            </p>
          </div>
          <button
            onClick={() => navigate("/explore")}
            className="btn-outline-gfg"
            style={{ padding: "6px 12px" }}
          >
            View All Courses →
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px" }}>
          {popularCourses.map((c, i) => (
            <div key={i} className="saas-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "14px", padding: "18px 20px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span className="badge-soft-primary">{c.category}</span>
                  <span className={c.difficulty === "Beginner" ? "badge-difficulty-easy" : c.difficulty === "Intermediate" ? "badge-difficulty-medium" : "badge-difficulty-hard"}>
                    {c.difficulty}
                  </span>
                </div>

                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "6px", color: "var(--text-primary)" }}>
                  {c.title}
                </h3>
                <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "12px" }}>
                  {c.description}
                </p>

                {/* Metadata Row */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={13} /> {c.duration}
                  </span>
                  <span>•</span>
                  <span>{c.modules} Modules</span>
                  <span>•</span>
                  <span style={{ color: "#d97706", display: "flex", alignItems: "center", gap: "2px" }}>
                    <Star size={13} fill="#d97706" /> {c.rating}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{c.students} Learners</span>
                <button
                  onClick={() => {
                    setTech(c.title);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="btn-gfg-primary"
                  style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                >
                  Start Track
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================
          STRUCTURED LEARNING PILLARS
          ========================== */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "16px" }}>Platform Architecture & Learning Pillars</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
          <div className="saas-card" style={{ padding: "18px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--primary-soft)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
              <Layers size={18} />
            </div>
            <h4 style={{ fontSize: "0.98rem", fontWeight: 700, marginBottom: "4px" }}>Structured Syllabus</h4>
            <p style={{ fontSize: "0.83rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Step-by-step topic breakdown with prerequisite dependencies and progress tracking.
            </p>
          </div>

          <div className="saas-card" style={{ padding: "18px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--primary-soft)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
              <CheckCircle size={18} />
            </div>
            <h4 style={{ fontSize: "0.98rem", fontWeight: 700, marginBottom: "4px" }}>Adaptive Skill Checks</h4>
            <p style={{ fontSize: "0.83rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Topic tests that detect subtle misconceptions and diagnose exactly where your mental model fails.
            </p>
          </div>

          <div className="saas-card" style={{ padding: "18px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--primary-soft)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
              <Terminal size={18} />
            </div>
            <h4 style={{ fontSize: "0.98rem", fontWeight: 700, marginBottom: "4px" }}>AI Code Review & Lab</h4>
            <p style={{ fontSize: "0.83rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Submit real code snippets for correctness, readability, and performance refactoring reviews.
            </p>
          </div>

          <div className="saas-card" style={{ padding: "18px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--primary-soft)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
              <ShieldCheck size={18} />
            </div>
            <h4 style={{ fontSize: "0.98rem", fontWeight: 700, marginBottom: "4px" }}>Proof-of-Skill Passport</h4>
            <p style={{ fontSize: "0.83rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Verified portfolio backed by passed assessments, debug solutions, and project evaluations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
