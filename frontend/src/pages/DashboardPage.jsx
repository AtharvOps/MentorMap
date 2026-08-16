import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCourses, deleteCourse } from "../services/api";
import { 
  Flame, Clock, CheckCircle2, Award, Play, 
  Trash2, Plus, ArrowRight, 
  BookOpen, Zap, Target, Terminal, BrainCircuit 
} from "lucide-react";
import { toast } from "react-toastify";

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);

  // Gamification Quests State
  const quests = [
    { id: 1, title: "Take 1 Practice Quiz", xp: 50, path: "/quizzes", done: false, icon: <BrainCircuit size={18} color="var(--primary)" /> },
    { id: 2, title: "Study 1 Editorial Note", xp: 30, path: "/notes", done: true, icon: <BookOpen size={18} color="var(--info)" /> },
    { id: 3, title: "Solve 1 Debug Challenge", xp: 75, path: "/lab", done: false, icon: <Terminal size={18} color="#d97706" /> }
  ];

  const fetchDashboardData = async () => {
    try {
      const res = await getCourses();
      setCourses(res.data || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDelete = async (courseId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this course pathway?")) return;
    try {
      await deleteCourse(courseId);
      setCourses(prev => prev.filter(c => c._id !== courseId));
      toast.success("Course removed from your dashboard");
    } catch (err) {
      toast.error("Failed to delete course");
    }
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 18) return "Good afternoon";
    return "Good evening";
  };

  const totalMinutes = user?.stats?.totalLearningMinutes || 120;
  const xp = totalMinutes * 10 + (user?.stats?.completedTopicsCount || 3) * 50;
  const level = Math.floor(xp / 500) + 1;
  const currentLevelXp = xp % 500;

  const badges = [
    { name: "Streak Slayer", icon: "🔥", desc: "3+ day streak", unlocked: (user?.stats?.streakDays || 1) >= 3 },
    { name: "Quiz Ace", icon: "🎯", desc: "100% on any quiz", unlocked: true },
    { name: "Bug Hunter", icon: "🐛", desc: "Solve 1 debug lab", unlocked: true },
    { name: "Code Architect", icon: "🏛️", desc: "Master full pathway", unlocked: courses.some(c => Number(c.progress) >= 50) },
    { name: "Interview Ready", icon: "💼", desc: "5-round mock pass", unlocked: false }
  ];

  const activeCourse = courses.find(c => (Number(c.progress) || 0) < 100) || courses[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "26px", paddingBottom: "60px" }}>
      {/* ==========================
          HEADER & WELCOME
          ========================== */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "4px" }}>
            {getGreeting()}, {user?.name || "Developer"} 👋
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", margin: 0 }}>
            Track your course progress, take topic assessments, and continue where you left off.
          </p>
        </div>

        <Link to="/explore" className="btn-gfg-primary" style={{ padding: "10px 18px", fontSize: "0.92rem" }}>
          <Plus size={16} />
          <span>+ Enroll in New Pathway</span>
        </Link>
      </div>

      {/* ==========================
          KEY METRICS STATS BAR
          ========================== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        {/* Streak */}
        <div className="saas-card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--warning-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Flame size={22} color="#d97706" />
          </div>
          <div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700 }}>ACTIVE STREAK</div>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)" }}>
              {user?.stats?.streakDays || 1} Days 🔥
            </div>
          </div>
        </div>

        {/* Study Hours */}
        <div className="saas-card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Clock size={22} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700 }}>STUDY TIME</div>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)" }}>
              {Math.round((user?.stats?.totalLearningMinutes || 0) / 60)}h { (user?.stats?.totalLearningMinutes || 0) % 60 }m
            </div>
          </div>
        </div>

        {/* Topics Completed */}
        <div className="saas-card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle2 size={22} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700 }}>TOPICS COMPLETED</div>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)" }}>
              {user?.stats?.completedTopicsCount || 0}
            </div>
          </div>
        </div>

        {/* Level & XP */}
        <div className="saas-card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={22} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700 }}>LEVEL & XP</div>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--primary)" }}>
              Lvl {level} • {xp} XP
            </div>
          </div>
        </div>
      </div>

      {/* ==========================
          GAMIFIED DAILY QUESTS & BADGES WIDGET
          ========================== */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px", flexWrap: "wrap" }}>
        {/* Daily Quests */}
        <div className="saas-card" style={{ padding: "22px 26px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Target size={18} color="var(--primary)" />
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0 }}>Daily Learning Quests</h3>
            </div>
            <span style={{ fontSize: "0.82rem", color: "var(--primary)", fontWeight: 700 }}>Resets Daily</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {quests.map(q => (
              <div
                key={q.id}
                onClick={() => navigate(q.path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--bg-input)",
                  border: "1px solid var(--border)",
                  cursor: "pointer"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {q.icon}
                  <span style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-primary)" }}>{q.title}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--primary)" }}>+{q.xp} XP</span>
                  {q.done ? <span style={{ fontSize: "0.78rem", color: "var(--primary)", fontWeight: 800 }}>✓ Done</span> : <ArrowRight size={14} color="var(--text-muted)" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="saas-card" style={{ padding: "22px 26px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Award size={18} color="#d97706" />
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0 }}>Achievement Badges</h3>
            </div>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>{badges.filter(b => b.unlocked).length}/{badges.length}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: "10px", textAlign: "center" }}>
            {badges.map((b, idx) => (
              <div
                key={idx}
                title={`${b.name}: ${b.desc}`}
                style={{
                  padding: "10px 6px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: b.unlocked ? "var(--primary-soft)" : "var(--bg-input)",
                  border: `1px solid ${b.unlocked ? "var(--primary-border)" : "var(--border)"}`,
                  opacity: b.unlocked ? 1 : 0.45
                }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "2px" }}>{b.icon}</div>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-primary)" }}>{b.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ==========================
          CONTINUE LEARNING HERO (GFG STYLE)
          ========================== */}
      {activeCourse && (
        <div 
          className="saas-card" 
          style={{ 
            padding: "24px 28px",
            borderLeft: "5px solid var(--primary)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px"
          }}
        >
          <div style={{ maxWidth: "700px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span className="badge-soft-primary">CONTINUE LEARNING</span>
              <span style={{ fontSize: "0.84rem", color: "var(--text-muted)", fontWeight: 600 }}>
                {activeCourse.progress || 0}% Completed
              </span>
            </div>

            <h3 style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "4px" }}>
              {activeCourse.technology} Extended Pathway
            </h3>

            <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", margin: "0 0 12px 0" }}>
              {activeCourse.goal || "Mastery"} • {activeCourse.difficulty || "Beginner"} level curriculum
            </p>

            {/* Progress line */}
            <div style={{ width: "100%", height: "7px", backgroundColor: "var(--bg-input)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${activeCourse.progress || 0}%`, backgroundColor: "var(--primary)" }} />
            </div>
          </div>

          <button
            onClick={() => navigate(`/courses/${activeCourse._id}`)}
            className="btn-gfg-primary"
            style={{ padding: "12px 24px", fontSize: "0.96rem" }}
          >
            <Play size={16} fill="white" />
            <span>Continue Learning</span>
          </button>
        </div>
      )}

      {/* ==========================
          ENROLLED COURSES SECTION
          ========================== */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800 }}>Enrolled Learning Pathways</h2>
          <span style={{ fontSize: "0.88rem", color: "var(--text-muted)", fontWeight: 600 }}>{courses.length} Active Courses</span>
        </div>

        {courses.length === 0 ? (
          <div className="saas-card" style={{ textAlign: "center", padding: "48px 20px" }}>
            <BookOpen size={44} color="var(--text-muted)" style={{ margin: "0 auto 14px" }} />
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "6px" }}>No enrolled courses yet</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", maxWidth: "440px", margin: "0 auto 18px" }}>
              Enroll in a course track or generate a custom roadmap to start your learning journey.
            </p>
            <Link to="/explore" className="btn-gfg-primary">
              <Plus size={16} />
              <span>Explore Course Catalog</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "18px" }}>
            {courses.map((course) => {
              const progressVal = Number(course.progress) || 0;
              const radius = 24;
              const circ = 2 * Math.PI * radius;
              const strokeDashoffset = circ - (progressVal / 100) * circ;

              return (
                <div 
                  key={course._id} 
                  className="saas-card"
                  onClick={() => navigate(`/courses/${course._id}`)}
                  style={{ cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <span className="badge-soft-primary" style={{ marginBottom: "6px", display: "inline-block" }}>
                        {course.goal || "Mastery"}
                      </span>
                      <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-primary)" }}>
                        {course.technology}
                      </h3>
                      <div style={{ fontSize: "0.84rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        {course.difficulty || "Beginner"} • {course.estimatedDuration || "4-6 weeks"}
                      </div>
                    </div>

                    {/* Circular SVG Progress */}
                    <div style={{ position: "relative", width: "56px", height: "56px" }}>
                      <svg width="56" height="56" style={{ transform: "rotate(-90deg)" }}>
                        <circle cx="28" cy="28" r={radius} stroke="var(--bg-input)" strokeWidth="5" fill="transparent" />
                        <circle
                          cx="28"
                          cy="28"
                          r={radius}
                          stroke="var(--primary)"
                          strokeWidth="5"
                          fill="transparent"
                          strokeDasharray={circ}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.82rem", fontWeight: 800 }}>
                        {progressVal}%
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "14px", borderTop: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--primary)", fontWeight: 700, fontSize: "0.9rem" }}>
                      <span>Continue Syllabus</span>
                      <ArrowRight size={15} />
                    </div>

                    <button
                      onClick={(e) => handleDelete(course._id, e)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}
                      title="Remove Course"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
