import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { updateLearnerTwinPreferences } from "../services/api";
import { 
  Sun, Moon, Check, Save 
} from "lucide-react";
import { toast } from "react-toastify";

const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const [weeklyTargetHours, setWeeklyTargetHours] = useState(5);
  const [preferredLearningStyle, setPreferredLearningStyle] = useState("Visual & Code-first");
  const [saving, setSaving] = useState(false);

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateLearnerTwinPreferences({
        weeklyTargetHours: Number(weeklyTargetHours),
        preferredLearningStyle
      });
      toast.success("Learning preferences updated successfully!");
    } catch (err) {
      toast.error("Failed to update preferences.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", paddingBottom: "60px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Account & Learning Settings</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: 0 }}>
          Manage your interface appearance, weekly study targets, and learning preferences.
        </p>
      </div>

      {/* Appearance */}
      <div className="saas-card" style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "12px" }}>Interface Theme</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div
            onClick={() => setTheme("light")}
            style={{
              padding: "16px",
              borderRadius: "var(--radius-sm)",
              border: `2px solid ${theme === "light" ? "var(--primary)" : "var(--border)"}`,
              backgroundColor: "#ffffff",
              color: "#1f2937",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}
          >
            <Sun size={20} color="#f59e0b" />
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>Light Mode</div>
              <div style={{ fontSize: "0.76rem", color: "#6b7280" }}>Standard GFG clean contrast</div>
            </div>
          </div>

          <div
            onClick={() => setTheme("dark")}
            style={{
              padding: "16px",
              borderRadius: "var(--radius-sm)",
              border: `2px solid ${theme === "dark" ? "var(--primary)" : "var(--border)"}`,
              backgroundColor: "#131b2e",
              color: "#f8fafc",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}
          >
            <Moon size={20} color="#60a5fa" />
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>Dark Charcoal</div>
              <div style={{ fontSize: "0.76rem", color: "#94a3b8" }}>Low light & night coding</div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Goals Form */}
      <div className="saas-card" style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "16px" }}>Learning Preferences</h2>
        <form onSubmit={handleSavePreferences} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px" }}>
              WEEKLY STUDY TARGET (HOURS)
            </label>
            <input
              type="number"
              min="1"
              max="40"
              value={weeklyTargetHours}
              onChange={(e) => setWeeklyTargetHours(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-input)",
                color: "var(--text-primary)",
                outline: "none",
                fontSize: "0.9rem"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px" }}>
              PRIMARY LEARNING STYLE
            </label>
            <select
              value={preferredLearningStyle}
              onChange={(e) => setPreferredLearningStyle(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-input)",
                color: "var(--text-primary)",
                outline: "none",
                fontSize: "0.9rem"
              }}
            >
              <option value="Visual & Code-first">Visual & Code-first (Mental models + snippets)</option>
              <option value="Deep Conceptual Theory">Deep Conceptual Theory (First principles)</option>
              <option value="Problem Solving Heavy">Problem Solving Heavy (LeetCode & MCQ focus)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-gfg-primary"
            style={{ padding: "10px 20px", alignSelf: "flex-start" }}
          >
            <Save size={15} />
            <span>{saving ? "Saving Changes..." : "Save Preferences"}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
