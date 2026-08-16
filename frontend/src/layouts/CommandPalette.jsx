import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, BookOpen, BrainCircuit, Code, Terminal, 
  Award, BarChart2, Compass, FileText, CheckCircle, 
  Settings, Sparkles, X 
} from "lucide-react";

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const commands = [
    { title: "Dashboard", category: "Navigation", icon: <BarChart2 size={18} />, path: "/dashboard" },
    { title: "My Roadmaps", category: "Navigation", icon: <Compass size={18} />, path: "/dashboard" },
    { title: "Explore Tech Pathways", category: "Navigation", icon: <Sparkles size={18} />, path: "/explore" },
    { title: "AI Socratic Tutor", category: "AI Mentor", icon: <BrainCircuit size={18} />, path: "/tutor" },
    { title: "AI Study Notes", category: "Learning", icon: <FileText size={18} />, path: "/notes" },
    { title: "Adaptive Quizzes", category: "Practice", icon: <CheckCircle size={18} />, path: "/quizzes" },
    { title: "Explain-Back Practice", category: "Practice", icon: <BookOpen size={18} />, path: "/explain/React" },
    { title: "Interactive Experiment Lab", category: "Practice", icon: <Terminal size={18} />, path: "/lab/React" },
    { title: "Project Missions & Evaluator", category: "Build", icon: <Code size={18} />, path: "/projects" },
    { title: "Technical Interview Simulator", category: "Career", icon: <Terminal size={18} />, path: "/interview" },
    { title: "Learning Analytics & Heatmap", category: "Analytics", icon: <BarChart2 size={18} />, path: "/analytics" },
    { title: "Proof-of-Skill Passport", category: "Profile", icon: <Award size={18} />, path: "/profile" },
    { title: "Settings & Preferences", category: "System", icon: <Settings size={18} />, path: "/settings" }
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        onClose(!isOpen);
      }
      if (e.key === "Escape" && isOpen) {
        onClose(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = commands.filter(c => 
    c.title.toLowerCase().includes(query.toLowerCase()) || 
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path) => {
    navigate(path);
    onClose(false);
    setQuery("");
  };

  return (
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "12vh",
        zIndex: 9999
      }}
      onClick={() => onClose(false)}
    >
      <div 
        style={{
          width: "100%",
          maxWidth: "580px",
          backgroundColor: "var(--bg-surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-xl)",
          overflow: "hidden"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border)", gap: "12px" }}>
          <Search size={20} color="var(--text-muted)" />
          <input 
            type="text"
            placeholder="Type a command or search topic..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              fontSize: "1rem",
              color: "var(--text-primary)",
              fontFamily: "var(--font-sans)"
            }}
          />
          <button 
            onClick={() => onClose(false)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Command List */}
        <div style={{ maxHeight: "380px", overflowY: "auto", padding: "8px" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
              No matching commands or pages found.
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => handleSelect(item.path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  color: "var(--text-primary)",
                  transition: "background-color 0.15s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--primary-soft)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ color: "var(--primary)", display: "flex" }}>{item.icon}</span>
                  <span style={{ fontWeight: 500 }}>{item.title}</span>
                </div>
                <span className="badge-soft-primary" style={{ fontSize: "0.72rem" }}>{item.category}</span>
              </div>
            ))
          )}
        </div>

        {/* Footer Hint */}
        <div style={{ padding: "10px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-muted)" }}>
          <span>Navigate with mouse or enter</span>
          <span><kbd style={{ background: "var(--bg-input)", padding: "2px 6px", borderRadius: "4px", border: "1px solid var(--border)" }}>ESC</kbd> to close</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
