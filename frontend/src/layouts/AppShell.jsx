import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import CommandPalette from "./CommandPalette";
import { generatePathway, saveCourse } from "../services/api";
import logo from "../assets/logo.png";
import {
  LayoutDashboard,
  Compass,
  FileText,
  CheckCircle,
  BrainCircuit,
  Terminal,
  Code2,
  Briefcase,
  BarChart3,
  Award,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  Search,
  Flame,
  User,
  Plus,
  Info,
  Sparkles,
  Zap,
  X
} from "lucide-react";
import { toast } from "react-toastify";

const AppShell = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Global Course Generator Modal
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [modalTech, setModalTech] = useState("");
  const [modalGoal, setModalGoal] = useState("Become job-ready");
  const [modalExperience, setModalExperience] = useState("Beginner");
  const [modalLoading, setModalLoading] = useState(false);

  const navItems = [
    { title: "My Dashboard", icon: <LayoutDashboard size={20} />, path: "/dashboard", authOnly: true },
    { title: "Explore Courses", icon: <Compass size={20} />, path: "/explore" },
    { title: "AI Socratic Tutor", icon: <BrainCircuit size={20} />, path: "/tutor" },
    { title: "Editorial Notes", icon: <FileText size={20} />, path: "/notes" },
    { title: "Practice Quizzes", icon: <CheckCircle size={20} />, path: "/quizzes" },
    { title: "Coding & Debug Lab", icon: <Terminal size={20} />, path: "/lab" },
    { title: "Project Missions", icon: <Code2 size={20} />, path: "/projects", authOnly: true },
    { title: "Interview Prep", icon: <Briefcase size={20} />, path: "/interview" },
    { title: "Learning Analytics", icon: <BarChart3 size={20} />, path: "/analytics", authOnly: true },
    { title: "Skill Passport", icon: <Award size={20} />, path: "/profile", authOnly: true },
    { title: "About MentorMap", icon: <Info size={20} />, path: "/about" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleModalGenerateCourse = async (e) => {
    e.preventDefault();
    if (!modalTech.trim()) {
      toast.warning("Please enter a subject or technology name.");
      return;
    }

    setModalLoading(true);
    try {
      const response = await generatePathway({
        technology: modalTech.trim(),
        goal: modalGoal,
        experience: modalExperience
      });

      if (isAuthenticated) {
        const saveRes = await saveCourse({
          technology: modalTech.trim(),
          pathway: response.data.pathway,
          goal: modalGoal,
          experience: modalExperience,
          difficulty: modalExperience
        });
        toast.success(`Course "${modalTech.trim()}" generated and added to your dashboard!`);
        setIsGenModalOpen(false);
        setModalTech("");
        navigate(`/courses/${saveRes.data.pathway._id}`);
      } else {
        setIsGenModalOpen(false);
        navigate("/explore", { state: { generatedPathway: response.data } });
      }
    } catch (err) {
      toast.error("Failed to generate course. Please try again.");
    } finally {
      setModalLoading(false);
    }
  };

  // Gamification XP & Level calculation
  const totalMinutes = user?.stats?.totalLearningMinutes || 120;
  const xp = totalMinutes * 10 + (user?.stats?.completedTopicsCount || 3) * 50;
  const level = Math.floor(xp / 500) + 1;
  const currentLevelXp = xp % 500;
  const levelProgress = Math.min(100, Math.round((currentLevelXp / 500) * 100));

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-app)" }}>
      {/* Search Command Palette */}
      <CommandPalette isOpen={isCommandOpen} onClose={setIsCommandOpen} />

      {/* Global Course Generator Modal */}
      {isGenModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div className="saas-card" style={{ maxWidth: "520px", width: "100%", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={20} color="var(--primary)" />
                <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Generate Structured Course</h2>
              </div>
              <button onClick={() => setIsGenModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "18px" }}>
              Generate an exhaustive, multi-level curriculum with knowledge dependency graphs and practice checks.
            </p>

            <form onSubmit={handleModalGenerateCourse} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "4px" }}>
                  WHAT DO YOU WANT TO LEARN?
                </label>
                <input
                  type="text"
                  placeholder="e.g. Data Structures & Algorithms, React, Python, Docker..."
                  value={modalTech}
                  onChange={(e) => setModalTech(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--border)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)", outline: "none", fontSize: "0.95rem" }}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, marginBottom: "4px" }}>GOAL</label>
                  <select
                    value={modalGoal}
                    onChange={(e) => setModalGoal(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)", outline: "none", fontSize: "0.86rem" }}
                  >
                    <option value="Become job-ready">Become job-ready</option>
                    <option value="Prepare for interviews">Interview Prep</option>
                    <option value="Build a real-world project">Build Project</option>
                    <option value="College exams">College Exams</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, marginBottom: "4px" }}>EXPERIENCE</label>
                  <select
                    value={modalExperience}
                    onChange={(e) => setModalExperience(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)", outline: "none", fontSize: "0.86rem" }}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={modalLoading}
                className="btn-gfg-primary"
                style={{ width: "100%", padding: "11px", justifyContent: "center", marginTop: "8px" }}
              >
                <span>{modalLoading ? "Building Exhaustive Curriculum..." : "Generate & Start Learning →"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            zIndex: 999
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* =======================
          DEVELOPER SIDEBAR
          ======================= */}
      <aside
        style={{
          width: sidebarCollapsed ? "74px" : "250px",
          backgroundColor: "var(--bg-sidebar)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 1000,
          transition: "width 0.15s ease",
          flexShrink: 0
        }}
      >
        {/* Brand Header with Logo */}
        <div
          style={{
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarCollapsed ? "center" : "flex-start",
            gap: "12px",
            borderBottom: "1px solid var(--border)",
            height: "64px"
          }}
        >
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src={logo}
              alt="MentorMap Logo"
              style={{
                width: "36px",
                height: "36px",
                objectFit: "contain"
              }}
            />
            {!sidebarCollapsed && (
              <div>
                <span style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                  Mentor<span style={{ color: "var(--primary)" }}>Map</span>
                </span>
                <span style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700 }}>
                  LEARNING PORTAL
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Gamified Level & Streak Widget */}
        {!sidebarCollapsed && (
          <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div
              style={{
                backgroundColor: "var(--primary-soft)",
                borderRadius: "var(--radius-sm)",
                padding: "8px 12px",
                border: "1px solid var(--primary-border)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Zap size={15} color="var(--primary)" />
                  <span style={{ fontSize: "0.84rem", fontWeight: 800, color: "var(--primary)" }}>
                    Level {level}
                  </span>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>
                  {xp} XP
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ height: "4px", backgroundColor: "var(--bg-surface)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${levelProgress}%`, backgroundColor: "var(--primary)" }} />
              </div>
            </div>

            {isAuthenticated && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px", fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Flame size={15} color="#d97706" /> {user?.stats?.streakDays || 1} Day Streak
                </span>
                <span>{Math.round(totalMinutes / 60)}h Total</span>
              </div>
            )}
          </div>
        )}

        {/* Sidebar Nav Items */}
        <div style={{ flex: 1, padding: "8px 8px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "3px" }}>
          {navItems.map((item, idx) => {
            if (item.authOnly && !isAuthenticated) return null;
            const active = location.pathname.startsWith(item.path);

            return (
              <Link
                key={idx}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                title={sidebarCollapsed ? item.title : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: sidebarCollapsed ? "12px 0" : "10px 14px",
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  borderRadius: "var(--radius-sm)",
                  textDecoration: "none",
                  color: active ? "var(--primary)" : "var(--sidebar-text)",
                  backgroundColor: active ? "var(--sidebar-active-bg)" : "transparent",
                  fontWeight: active ? 700 : 500,
                  fontSize: "0.96rem",
                  borderLeft: active ? "3px solid var(--primary)" : "3px solid transparent",
                  transition: "background-color 0.1s ease"
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = "var(--bg-input)";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <span style={{ color: active ? "var(--primary)" : "var(--text-muted)", display: "flex" }}>
                  {item.icon}
                </span>
                {!sidebarCollapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer with Developer credit link */}
        <div style={{ padding: "8px 8px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "3px" }}>
          <Link
            to="/settings"
            title={sidebarCollapsed ? "Settings" : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: sidebarCollapsed ? "10px 0" : "8px 14px",
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              borderRadius: "var(--radius-sm)",
              textDecoration: "none",
              color: "var(--sidebar-text)",
              fontSize: "0.92rem",
              fontWeight: 500
            }}
          >
            <Settings size={18} color="var(--text-muted)" />
            {!sidebarCollapsed && <span>Settings</span>}
          </Link>

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              title={sidebarCollapsed ? "Logout" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: sidebarCollapsed ? "10px 0" : "8px 14px",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
                borderRadius: "var(--radius-sm)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--danger)",
                fontSize: "0.92rem",
                fontWeight: 600,
                width: "100%",
                textAlign: "left"
              }}
            >
              <LogOut size={18} color="var(--danger)" />
              {!sidebarCollapsed && <span>Log Out</span>}
            </button>
          ) : (
            <Link
              to="/login"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: sidebarCollapsed ? "10px 0" : "8px 14px",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
                color: "var(--primary)",
                fontWeight: 700,
                fontSize: "0.94rem"
              }}
            >
              <User size={18} color="var(--primary)" />
              {!sidebarCollapsed && <span>Sign In</span>}
            </Link>
          )}
        </div>
      </aside>

      {/* =======================
          MAIN APP CONTENT & STICKY HEADER
          ======================= */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Sticky Header */}
        <header
          style={{
            height: "64px",
            backgroundColor: "var(--bg-header)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            position: "sticky",
            top: 0,
            zIndex: 900
          }}
        >
          {/* Left: Mobile Drawer Trigger + Collapse + Search Trigger */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="d-md-none"
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)" }}
            >
              <Menu size={22} />
            </button>

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="d-none d-md-block"
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              title="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>

            {/* Quick Search */}
            <button
              onClick={() => setIsCommandOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border)",
                padding: "8px 16px",
                borderRadius: "var(--radius-md)",
                color: "var(--text-muted)",
                fontSize: "0.92rem",
                cursor: "pointer"
              }}
            >
              <Search size={16} />
              <span>Search courses, DSA topics, notes...</span>
              <kbd style={{ background: "var(--bg-surface)", padding: "2px 6px", borderRadius: "4px", border: "1px solid var(--border)", fontSize: "0.76rem" }}>
                Ctrl + K
              </kbd>
            </button>
          </div>

          {/* Right: + Generate Course CTA, Theme Toggle, Profile */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setIsGenModalOpen(true)}
              className="btn-gfg-primary"
              style={{ padding: "8px 16px", fontSize: "0.9rem" }}
            >
              <Plus size={16} />
              <span>+ Generate Course</span>
            </button>

            {/* Dark/Light Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                background: "none",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-input)",
                borderRadius: "var(--radius-md)",
                padding: "7px 10px",
                cursor: "pointer",
                color: "var(--text-primary)",
                display: "flex",
                alignItems: "center"
              }}
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#64748b" />}
            </button>

            {/* User Avatar */}
            {isAuthenticated ? (
              <Link to="/profile" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: "var(--primary-soft)",
                    color: "var(--primary)",
                    fontWeight: 800,
                    fontSize: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid var(--primary)"
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              </Link>
            ) : (
              <Link
                to="/login"
                style={{
                  color: "var(--primary)",
                  fontWeight: 700,
                  textDecoration: "none",
                  fontSize: "0.92rem",
                  padding: "7px 14px"
                }}
              >
                Sign In
              </Link>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: "24px 28px", maxWidth: "1400px", width: "100%", margin: "0 auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
