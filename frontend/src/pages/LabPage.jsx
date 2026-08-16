import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { requestAICodeReview, getDebugChallenge } from "../services/api";
import { 
  Terminal, Code2, Bug, RefreshCw 
} from "lucide-react";
import { toast } from "react-toastify";

const LabPage = () => {
  const { topicId } = useParams();
  const [activeTab, setActiveTab] = useState("REVIEW"); // "REVIEW" | "DEBUG"

  // Code Review State
  const [code, setCode] = useState(`// Paste your algorithm or component code here
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`);
  const [problemContext, setProblemContext] = useState("");
  const [reviewResult, setReviewResult] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Debug Challenge State
  const [debugTopic, setDebugTopic] = useState(topicId ? decodeURIComponent(topicId) : "Array Algorithms");
  const [challenge, setChallenge] = useState(null);
  const [userFixCode, setUserFixCode] = useState("");
  const [debugLoading, setDebugLoading] = useState(false);
  const [revealedHints, setRevealedHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  const handleRunCodeReview = async () => {
    if (!code.trim()) return;
    setReviewLoading(true);
    try {
      const response = await requestAICodeReview({ code, language: "javascript", problemContext });
      setReviewResult(response.data.review);
      toast.success("Code review completed!");
    } catch (err) {
      toast.error("Failed to run code review.");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleFetchChallenge = async () => {
    setDebugLoading(true);
    setRevealedHints(0);
    setShowSolution(false);
    try {
      const response = await getDebugChallenge({ topic: debugTopic });
      setChallenge(response.data.challenge);
      setUserFixCode(response.data.challenge?.buggyCode || "");
      toast.success("Debug challenge generated!");
    } catch (err) {
      toast.error("Failed to generate challenge.");
    } finally {
      setDebugLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", paddingBottom: "60px", display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* Header & Mode Switcher */}
      <div className="saas-card" style={{ padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>Coding & Troubleshooting Lab</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.86rem", margin: 0 }}>
            Automated code quality & performance diagnostics and authentic debugging scenarios.
          </p>
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={() => setActiveTab("REVIEW")}
            className={activeTab === "REVIEW" ? "btn-gfg-primary" : "btn-secondary-gfg"}
            style={{ padding: "6px 14px", fontSize: "0.82rem" }}
          >
            <Code2 size={15} /> AI Code Reviewer
          </button>

          <button
            onClick={() => setActiveTab("DEBUG")}
            className={activeTab === "DEBUG" ? "btn-gfg-primary" : "btn-secondary-gfg"}
            style={{ padding: "6px 14px", fontSize: "0.82rem" }}
          >
            <Bug size={15} /> Debugging Challenges
          </button>
        </div>
      </div>

      {/* ==========================
          TAB 1: AI CODE REVIEWER
          ========================== */}
      {activeTab === "REVIEW" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
          {/* Input side */}
          <div className="saas-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 800 }}>Submit Code for Review</h2>
            <textarea
              rows={13}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-input)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.88rem",
                outline: "none"
              }}
            />

            <input
              type="text"
              placeholder="Context / Problem description (e.g. Find two numbers adding to target in O(N))..."
              value={problemContext}
              onChange={(e) => setProblemContext(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-input)",
                color: "var(--text-primary)",
                outline: "none",
                fontSize: "0.84rem"
              }}
            />

            <button
              onClick={handleRunCodeReview}
              disabled={reviewLoading}
              className="btn-gfg-primary"
              style={{ padding: "10px", justifyContent: "center" }}
            >
              {reviewLoading ? <RefreshCw size={15} className="spin" /> : <Terminal size={15} />}
              <span>{reviewLoading ? "Reviewing..." : "Run Code Review"}</span>
            </button>
          </div>

          {/* Results side */}
          <div className="saas-card" style={{ padding: "20px", overflowY: "auto", maxHeight: "600px" }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: "14px" }}>Review Diagnostics</h2>

            {reviewResult ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", textAlign: "center" }}>
                  <div style={{ padding: "8px", backgroundColor: "var(--primary-soft)", borderRadius: "var(--radius-sm)", border: "1px solid var(--primary-border)" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--primary)", fontWeight: 700 }}>OVERALL</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--primary)" }}>{reviewResult.score}/10</div>
                  </div>
                  <div style={{ padding: "8px", backgroundColor: "var(--bg-input)", borderRadius: "var(--radius-sm)" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>CORRECT</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 800 }}>{reviewResult.correctness}/10</div>
                  </div>
                  <div style={{ padding: "8px", backgroundColor: "var(--bg-input)", borderRadius: "var(--radius-sm)" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>CLEAN</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 800 }}>{reviewResult.readability}/10</div>
                  </div>
                  <div style={{ padding: "8px", backgroundColor: "var(--bg-input)", borderRadius: "var(--radius-sm)" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>PERF</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 800 }}>{reviewResult.performance}/10</div>
                  </div>
                </div>

                <p style={{ fontSize: "0.88rem", color: "var(--text-primary)", lineHeight: 1.5 }}>
                  {reviewResult.summary}
                </p>

                {reviewResult.suggestions && reviewResult.suggestions.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "8px" }}>Suggestions & Refactors:</h3>
                    {reviewResult.suggestions.map((s, i) => (
                      <div key={i} style={{ padding: "10px 12px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", marginBottom: "8px" }}>
                        <span className="badge-soft-warning" style={{ fontSize: "0.72rem" }}>{s.type}</span>
                        <p style={{ margin: "4px 0 6px", fontSize: "0.82rem", color: "var(--text-primary)" }}>{s.comment}</p>
                        {s.improvedSnippet && (
                          <pre style={{ padding: "8px", background: "var(--bg-surface)", borderRadius: "var(--radius-xs)", fontSize: "0.78rem", color: "var(--primary)", margin: 0 }}>
                            <code>{s.improvedSnippet}</code>
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "50px 20px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Submit code on the left to receive instant rubric feedback and performance suggestions.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================
          TAB 2: DEBUGGING CHALLENGES
          ========================== */}
      {activeTab === "DEBUG" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="saas-card" style={{ padding: "16px", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Topic (e.g. Binary Search, React Hooks, Async/Await...)"
              value={debugTopic}
              onChange={(e) => setDebugTopic(e.target.value)}
              style={{
                flex: 1,
                minWidth: "220px",
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-input)",
                color: "var(--text-primary)",
                outline: "none",
                fontSize: "0.88rem"
              }}
            />
            <button
              onClick={handleFetchChallenge}
              disabled={debugLoading}
              className="btn-gfg-primary"
            >
              {debugLoading ? <RefreshCw size={14} className="spin" /> : <Bug size={14} />}
              <span>Generate Bug Challenge</span>
            </button>
          </div>

          {challenge ? (
            <div className="saas-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <span className="badge-difficulty-hard" style={{ marginBottom: "6px", display: "inline-block" }}>BROKEN CODE SCENARIO</span>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>{challenge.title}</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginTop: "2px" }}>{challenge.scenario}</p>
                <div style={{ fontSize: "0.82rem", color: "var(--primary)", fontWeight: 700, marginTop: "4px" }}>
                  Expected: {challenge.expectedBehavior}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontWeight: 700, marginBottom: "4px" }}>TROUBLESHOOT & FIX:</div>
                <textarea
                  rows={8}
                  value={userFixCode}
                  onChange={(e) => setUserFixCode(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg-input)",
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.88rem",
                    outline: "none"
                  }}
                />
              </div>

              {/* Hints */}
              {challenge.hints && challenge.hints.length > 0 && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>Hints ({revealedHints}/{challenge.hints.length}):</span>
                    {revealedHints < challenge.hints.length && (
                      <button
                        onClick={() => setRevealedHints(prev => prev + 1)}
                        className="btn-outline-gfg"
                        style={{ padding: "2px 8px", fontSize: "0.72rem" }}
                      >
                        Reveal Hint 💡
                      </button>
                    )}
                  </div>
                  {challenge.hints.slice(0, revealedHints).map((h, i) => (
                    <div key={i} style={{ padding: "6px 10px", borderRadius: "var(--radius-xs)", backgroundColor: "var(--warning-soft)", color: "var(--text-primary)", fontSize: "0.82rem", marginBottom: "4px" }}>
                      <strong>Hint {i + 1}:</strong> {h}
                    </div>
                  ))}
                </div>
              )}

              {/* Solution */}
              <div>
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="btn-secondary-gfg"
                  style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                >
                  {showSolution ? "Hide Solution" : "Reveal Verified Fix"}
                </button>

                {showSolution && (
                  <div style={{ marginTop: "10px", padding: "14px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--primary-soft)", border: "1px solid var(--primary-border)" }}>
                    <div style={{ fontWeight: 700, color: "var(--primary)", fontSize: "0.85rem", marginBottom: "4px" }}>Correct Fix:</div>
                    <pre style={{ padding: "8px", background: "var(--bg-surface)", borderRadius: "var(--radius-xs)", fontSize: "0.82rem", color: "var(--text-primary)", overflowX: "auto" }}>
                      <code>{challenge.solution}</code>
                    </pre>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-primary)", marginTop: "6px", margin: 0 }}>
                      <strong>Reason:</strong> {challenge.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="saas-card" style={{ textAlign: "center", padding: "50px 20px" }}>
              <Bug size={40} color="var(--text-muted)" style={{ margin: "0 auto 12px" }} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "6px" }}>Generate a debug challenge above</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.86rem", maxWidth: "420px", margin: "0 auto" }}>
                Diagnose edge-case bugs and verify your troubleshooting methodology.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LabPage;
