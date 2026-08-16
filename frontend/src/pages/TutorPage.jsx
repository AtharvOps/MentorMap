import React, { useState } from "react";
import { chatWithTutor } from "../services/api";
import { Send } from "lucide-react";
import { toast } from "react-toastify";

const TutorPage = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I am your AI Socratic Engineering Mentor. What concept or problem would you like to explore today? (e.g. Dynamic Programming, Redux vs Context, Indexing in Databases...)"
    }
  ]);
  const [input, setInput] = useState("");
  const [topic] = useState("General Technical Concepts");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    const sentText = input;
    setInput("");
    setLoading(true);

    try {
      const historyPayload = updated.map(m => ({ role: m.role, content: m.content }));
      const response = await chatWithTutor({
        message: sentText,
        topic,
        history: historyPayload
      });

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: response.data.reply }
      ]);
    } catch (err) {
      toast.error("Mentor service unavailable. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "880px", margin: "0 auto", paddingBottom: "60px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="saas-card" style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
          <span className="badge-soft-primary">SOCRATIC AI TUTOR</span>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Conceptual Inquiries & Progressive Hints</span>
        </div>
        <h1 style={{ fontSize: "1.35rem", fontWeight: 800 }}>1-on-1 Engineering Mentor</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.86rem", margin: 0 }}>
          Ask questions, get analogies, and learn why solutions work through interactive inquiry.
        </p>
      </div>

      <div className="saas-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px", minHeight: "440px" }}>
        {/* Chat History */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px", maxHeight: "420px", overflowY: "auto" }}>
          {messages.map((m, idx) => {
            const isUser = m.role === "user";
            return (
              <div
                key={idx}
                style={{
                  alignSelf: isUser ? "flex-end" : "flex-start",
                  maxWidth: "82%",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: isUser ? "var(--primary-soft)" : "var(--bg-input)",
                  border: `1px solid ${isUser ? "var(--primary-border)" : "var(--border)"}`,
                  color: "var(--text-primary)",
                  fontSize: "0.88rem",
                  lineHeight: 1.55
                }}
              >
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: isUser ? "var(--primary)" : "var(--text-muted)", marginBottom: "4px" }}>
                  {isUser ? "You" : "Senior Socratic Mentor"}
                </div>
                <div>{m.content}</div>
              </div>
            );
          })}
          {loading && (
            <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
              Mentor is crafting guiding thoughts...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
          <input
            type="text"
            placeholder="Ask a technical question or explain what is confusing..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-input)",
              color: "var(--text-primary)",
              outline: "none",
              fontSize: "0.88rem"
            }}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-gfg-primary"
            style={{ padding: "10px 18px" }}
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default TutorPage;
