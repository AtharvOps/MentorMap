import React, { useState } from "react";
import { simulateInterviewTurn } from "../services/api";
import { 
  Terminal, RefreshCw, Briefcase, Send, Award, CheckCircle2, AlertCircle 
} from "lucide-react";
import { toast } from "react-toastify";

const InterviewPage = () => {
  const [role, setRole] = useState("Full Stack Developer");
  const [topic, setTopic] = useState("React & Node.js Architecture");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userAnswer, setUserAnswer] = useState("");
  const [turnCount, setTurnCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleStartInterview = async () => {
    setLoading(true);
    setMessages([]);
    setFeedback(null);
    setTurnCount(1);
    try {
      const response = await simulateInterviewTurn({
        role,
        topic,
        history: [],
        userAnswer: "I am ready to begin the technical interview.",
        turnCount: 1
      });

      if (response.data && response.data.interviewerResponse) {
        setMessages([
          { role: "interviewer", content: response.data.interviewerResponse }
        ]);
        setInterviewStarted(true);
        toast.success("Technical Interview Initialized!");
      } else {
        toast.error("Failed to start interview session.");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to initialize the interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendAnswer = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim() || loading) return;

    const newHistory = [
      ...messages,
      { role: "candidate", content: userAnswer }
    ];
    setMessages(newHistory);
    const submittedAnswer = userAnswer;
    setUserAnswer("");
    setLoading(true);

    const nextTurn = turnCount + 1;
    setTurnCount(nextTurn);

    try {
      const response = await simulateInterviewTurn({
        role,
        topic,
        history: newHistory,
        userAnswer: submittedAnswer,
        turnCount: nextTurn
      });

      if (response.data.finalReadinessScore !== undefined) {
        setFeedback(response.data);
      }

      setMessages(prev => [
        ...prev,
        { role: "interviewer", content: response.data.interviewerResponse }
      ]);
    } catch (err) {
      toast.error("Interviewer connection timed out. Please retry sending your response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "60px", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header & Config Card */}
      <div className="saas-card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
          <span className="badge-soft-primary">MOCK TECHNICAL INTERVIEW</span>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>5-Round Senior Principal Engineering Simulation</span>
        </div>

        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "8px" }}>Technical Mock Interview Simulator</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "22px" }}>
          Simulates an authentic senior interviewer evaluating system design trade-offs, concurrency, data structures, and architectural communication.
        </p>

        {!interviewStarted ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "6px" }}>TARGET ROLE</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)", outline: "none", fontSize: "0.95rem" }}
              >
                <option value="Frontend Engineer">Frontend Engineer (React/TypeScript)</option>
                <option value="Backend Engineer">Backend Engineer (Node/Python/Java)</option>
                <option value="Full Stack Developer">Full Stack Developer (MERN / Full Stack)</option>
                <option value="System Design & Cloud Architect">System Design & Cloud Architect</option>
                <option value="DevOps & SRE Engineer">DevOps & SRE Engineer</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "6px" }}>FOCUS TECHNICAL TOPIC</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)", outline: "none", fontSize: "0.95rem" }}
              />
            </div>

            <div style={{ gridColumn: "span 2", marginTop: "8px" }}>
              <button
                onClick={handleStartInterview}
                disabled={loading}
                className="btn-gfg-primary"
                style={{ width: "100%", padding: "12px", justifyContent: "center", fontSize: "1rem" }}
              >
                {loading ? <RefreshCw size={16} className="spin" /> : <Terminal size={16} />}
                <span>{loading ? "Connecting with Senior Interviewer..." : "Start 5-Round Technical Interview →"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "14px", borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="badge-soft-primary">{role}</span>
              <span style={{ fontSize: "0.95rem", fontWeight: 800 }}>
                Round {Math.min(5, turnCount)} of 5
              </span>
            </div>
            <button
              onClick={() => {
                setInterviewStarted(false);
                setMessages([]);
                setFeedback(null);
              }}
              className="btn-secondary-gfg"
              style={{ padding: "6px 14px", fontSize: "0.85rem" }}
            >
              Reset Session
            </button>
          </div>
        )}
      </div>

      {/* Chat Session Area */}
      {interviewStarted && (
        <div className="saas-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "500px", overflowY: "auto", paddingRight: "4px" }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "candidate" ? "flex-end" : "flex-start",
                  maxWidth: "84%",
                  padding: "14px 18px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: m.role === "candidate" ? "var(--primary-soft)" : "var(--bg-input)",
                  border: `1.5px solid ${m.role === "candidate" ? "var(--primary-border)" : "var(--border)"}`,
                  color: "var(--text-primary)",
                  fontSize: "0.96rem",
                  lineHeight: 1.6
                }}
              >
                <div style={{ fontSize: "0.76rem", fontWeight: 800, color: m.role === "candidate" ? "var(--primary)" : "var(--text-muted)", marginBottom: "4px" }}>
                  {m.role === "candidate" ? "You (Candidate)" : "Senior Principal Interviewer"}
                </div>
                <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start", color: "var(--text-muted)", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <RefreshCw size={15} className="spin" />
                <span>Interviewer is evaluating your response...</span>
              </div>
            )}
          </div>

          {/* Response Input */}
          {!feedback ? (
            <form onSubmit={handleSendAnswer} style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <input
                type="text"
                placeholder="Explain your approach, architectural trade-offs, and technical reasoning..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: "1.5px solid var(--border)",
                  backgroundColor: "var(--bg-input)",
                  color: "var(--text-primary)",
                  outline: "none",
                  fontSize: "0.96rem"
                }}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-gfg-primary"
                style={{ padding: "12px 24px" }}
              >
                <Send size={16} />
                <span>Send</span>
              </button>
            </form>
          ) : (
            <div style={{ marginTop: "16px", padding: "20px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--primary-soft)", border: "1.5px solid var(--primary-border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Award size={24} color="var(--primary)" />
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--primary)", margin: 0 }}>
                  Interview Complete • Readiness Score: {feedback.finalReadinessScore}%
                </h3>
              </div>
              <p style={{ fontSize: "0.94rem", color: "var(--text-primary)", margin: "8px 0" }}>
                {feedback.interviewerResponse}
              </p>
              {feedback.strengths && (
                <div style={{ fontSize: "0.88rem", color: "var(--text-primary)", marginTop: "6px" }}>
                  <strong>Key Strengths:</strong> {feedback.strengths.join(", ")}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewPage;
