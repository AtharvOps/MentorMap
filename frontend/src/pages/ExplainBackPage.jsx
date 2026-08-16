import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { evaluateExplainBack } from "../services/api";
import { 
  HelpCircle, RefreshCw 
} from "lucide-react";
import { toast } from "react-toastify";

const ExplainBackPage = () => {
  const { topicId } = useParams();
  const currentTopic = topicId ? decodeURIComponent(topicId) : "Binary Search";

  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!explanation.trim()) return;

    setLoading(true);
    try {
      const res = await evaluateExplainBack({
        topic: currentTopic,
        explanation
      });
      setEvaluation(res.data.evaluation);
      toast.success("Explanation evaluated!");
    } catch (err) {
      toast.error("Failed to evaluate explanation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "820px", margin: "0 auto", paddingBottom: "60px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className="saas-card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
          <span className="badge-soft-primary">FEYNMAN EVALUATION</span>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Conceptual Mastery Check</span>
        </div>

        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "6px" }}>
          Explain Concept: {currentTopic}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.86rem", marginBottom: "20px" }}>
          Explain this concept simply in your own words as if teaching a beginner. The AI will evaluate clarity, accuracy, missing ideas, and subtle misconceptions.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <textarea
            rows={7}
            placeholder={`Explain what ${currentTopic} is, how it works under the hood, and when to use it...`}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-input)",
              color: "var(--text-primary)",
              fontSize: "0.9rem",
              lineHeight: 1.6,
              outline: "none"
            }}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-gfg-primary"
            style={{ padding: "10px 20px", alignSelf: "flex-start" }}
          >
            {loading ? <RefreshCw size={14} className="spin" /> : <HelpCircle size={14} />}
            <span>{loading ? "Evaluating Concept..." : "Submit Explanation"}</span>
          </button>
        </form>
      </div>

      {evaluation && (
        <div className="saas-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Evaluation Results</h2>
            <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--primary)" }}>
              {evaluation.score || 85}% Mastery
            </span>
          </div>

          <p style={{ fontSize: "0.88rem", color: "var(--text-primary)", lineHeight: 1.5, marginBottom: "14px" }}>
            {evaluation.feedback}
          </p>

          {evaluation.missingConcepts && evaluation.missingConcepts.length > 0 && (
            <div style={{ padding: "12px 14px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--warning-soft)", border: "1px solid var(--warning)", marginBottom: "10px" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>Missing Key Concepts:</div>
              <ul style={{ paddingLeft: "20px", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                {evaluation.missingConcepts.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExplainBackPage;
