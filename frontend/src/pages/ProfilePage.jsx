import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPublicPassport, getUserProfile } from "../services/api";
import { Award, Share2 } from "lucide-react";
import { toast } from "react-toastify";
import logo from "../assets/logo.png";

const ProfilePage = () => {
  const { id } = useParams();
  const { user: authUser } = useAuth();

  const [passportData, setPassportData] = useState(null);

  useEffect(() => {
    const fetchPassport = async () => {
      try {
        if (id) {
          const res = await getPublicPassport(id);
          setPassportData(res.data);
        } else {
          const res = await getUserProfile();
          setPassportData(res.data);
        }
      } catch (_) {}
    };
    fetchPassport();
  }, [id]);

  const user = passportData?.user || authUser;
  const achievements = passportData?.achievements || [
    { title: "Binary Search Master", description: "Scored 100% on Array & Binary Search assessment", date: "2026-08-10" },
    { title: "React Architecture Pro", description: "Completed real-world custom hooks & context project", date: "2026-08-12" },
    { title: "7-Day Consistent Learner", description: "Maintained active study streak for 7 consecutive days", date: "2026-08-15" }
  ];

  const shareUrl = `${window.location.origin}/share/${user?._id || "verified"}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Public Skill Passport link copied to clipboard!");
  };

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", paddingBottom: "60px", display: "flex", flexDirection: "column", gap: "22px" }}>
      {/* Profile Card */}
      <div className="saas-card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--primary-soft)",
                color: "var(--primary)",
                fontWeight: 800,
                fontSize: "1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid var(--primary)"
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "D"}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>{user?.name || "Developer"}</h1>
                <span className="badge-soft-success">Verified Learner</span>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "2px 0 0" }}>
                {user?.email || "developer@example.com"} • Member since 2026
              </p>
            </div>
          </div>

          <button onClick={copyShareLink} className="btn-outline-gfg">
            <Share2 size={14} />
            <span>Share Skill Passport</span>
          </button>
        </div>

        {/* 3 Overview Highlights */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", textAlign: "center", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>STREAK</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#d97706" }}>{user?.stats?.streakDays || 5} Days 🔥</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>STUDY TIME</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--primary)" }}>{Math.round((user?.stats?.totalLearningMinutes || 240) / 60)}h</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>ASSESSMENTS</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)" }}>{user?.stats?.completedTopicsCount || 8} Passed</div>
          </div>
        </div>
      </div>

      {/* Verified Skills & Badges */}
      <div className="saas-card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <img src={logo} alt="Logo" style={{ width: "20px", height: "20px", objectFit: "contain" }} />
          <h2 style={{ fontSize: "1.15rem", fontWeight: 800 }}>Demonstrated Skill Badges</h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {achievements.map((a, i) => (
            <div
              key={i}
              style={{
                padding: "14px 16px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--primary-border)",
                backgroundColor: "var(--primary-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--bg-surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Award size={20} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--text-primary)" }}>{a.title}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{a.description}</div>
                </div>
              </div>

              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Verified</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
