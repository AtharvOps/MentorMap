import React, { useState, useEffect } from "react";
import { getProjects, generateProjectMission, evaluateProjectSubmission } from "../services/api";
import { 
  Code2, CheckCircle2, 
  RefreshCw, Send, Plus 
} from "lucide-react";
import { toast } from "react-toastify";

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [topic, setTopic] = useState("Full Stack Web Development");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [genLoading, setGenLoading] = useState(false);

  // Evaluation Modal
  const [selectedProject, setSelectedProject] = useState(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);

  const fetchProjects = async () => {
    try {
      const res = await getProjects();
      setProjects(res.data || []);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleGenerateMission = async () => {
    if (!topic.trim()) return;
    setGenLoading(true);
    try {
      const res = await generateProjectMission({ topic, difficulty });
      setProjects(prev => [res.data.project, ...prev]);
      toast.success("Project mission generated!");
    } catch (err) {
      toast.error("Failed to generate project.");
    } finally {
      setGenLoading(false);
    }
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    setEvaluating(true);
    try {
      const res = await evaluateProjectSubmission(selectedProject._id, {
        githubUrl,
        liveUrl,
        submissionNotes
      });
      setEvalResult(res.data.evaluation);
      toast.success("Project evaluated!");
      fetchProjects();
    } catch (err) {
      toast.error("Failed to evaluate project.");
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div style={{ maxWidth: "1120px", margin: "0 auto", paddingBottom: "60px", display: "flex", flexDirection: "column", gap: "22px" }}>
      {/* Header & Generator */}
      <div className="saas-card" style={{ padding: "22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", marginBottom: "16px" }}>
          <div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>Portfolio Project Missions</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.86rem", margin: 0 }}>
              Practical engineering challenges with user stories, milestones, and automated rubric evaluations.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Topic/Stack (e.g. React & Node.js, Distributed Cache, REST API...)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            style={{
              flex: 2,
              minWidth: "220px",
              padding: "9px 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-input)",
              color: "var(--text-primary)",
              outline: "none",
              fontSize: "0.88rem"
            }}
          />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            style={{
              flex: 1,
              minWidth: "130px",
              padding: "9px 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-input)",
              color: "var(--text-primary)",
              outline: "none",
              fontSize: "0.86rem"
            }}
          >
            <option value="Beginner">Beginner (Foundations)</option>
            <option value="Intermediate">Intermediate (Full Stack)</option>
            <option value="Advanced">Advanced (Production-Grade)</option>
          </select>
          <button
            onClick={handleGenerateMission}
            disabled={genLoading}
            className="btn-gfg-primary"
            style={{ padding: "9px 16px" }}
          >
            {genLoading ? <RefreshCw size={14} className="spin" /> : <Plus size={14} />}
            <span>{genLoading ? "Generating..." : "Create Project Mission"}</span>
          </button>
        </div>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="saas-card" style={{ textAlign: "center", padding: "50px 20px" }}>
          <Code2 size={40} color="var(--text-muted)" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "6px" }}>No project missions created yet</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.86rem", maxWidth: "420px", margin: "0 auto" }}>
            Generate your first practical mission above to build and verify your portfolio.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "18px" }}>
          {projects.map((p) => (
            <div key={p._id} className="saas-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "14px", padding: "18px 20px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span className="badge-soft-primary">{p.difficulty || "Intermediate"}</span>
                  <span className={p.status === "COMPLETED" ? "badge-soft-success" : "badge-soft-warning"}>
                    {p.status || "IN_PROGRESS"}
                  </span>
                </div>

                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "6px" }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "12px" }}>
                  {p.description}
                </p>

                {p.techStack && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "12px" }}>
                    {p.techStack.map((tech, i) => (
                      <span key={i} style={{ padding: "2px 6px", borderRadius: "var(--radius-xs)", backgroundColor: "var(--bg-input)", color: "var(--text-muted)", fontSize: "0.72rem", fontWeight: 600 }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ paddingTop: "12px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {p.score ? (
                  <span style={{ fontSize: "0.84rem", fontWeight: 800, color: "var(--primary)" }}>
                    Verified Score: {p.score}/100
                  </span>
                ) : (
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Not yet evaluated</span>
                )}

                <button
                  onClick={() => {
                    setSelectedProject(p);
                    setEvalResult(null);
                  }}
                  className="btn-gfg-primary"
                  style={{ padding: "6px 12px", fontSize: "0.78rem" }}
                >
                  <Send size={13} />
                  <span>Submit Code</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submission & Evaluation Drawer Modal */}
      {selectedProject && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div className="saas-card" style={{ maxWidth: "600px", width: "100%", maxHeight: "90vh", overflowY: "auto", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Submit: {selectedProject.title}</h2>
              <button onClick={() => setSelectedProject(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.1rem" }}>✕</button>
            </div>

            <form onSubmit={handleEvaluate} style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, marginBottom: "4px" }}>GITHUB REPO URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/username/project"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)", outline: "none", fontSize: "0.86rem" }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, marginBottom: "4px" }}>LIVE DEPLOYMENT URL (OPTIONAL)</label>
                <input
                  type="url"
                  placeholder="https://project.vercel.app"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)", outline: "none", fontSize: "0.86rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, marginBottom: "4px" }}>SUBMISSION NOTES</label>
                <textarea
                  rows={3}
                  placeholder="Key features built, architecture choices, test coverage..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)", outline: "none", fontSize: "0.86rem" }}
                />
              </div>

              <button
                type="submit"
                disabled={evaluating}
                className="btn-gfg-primary"
                style={{ padding: "10px", justifyContent: "center" }}
              >
                {evaluating ? <RefreshCw size={14} className="spin" /> : <CheckCircle2 size={14} />}
                <span>{evaluating ? "Evaluating Submission..." : "Run AI Rubric Evaluation"}</span>
              </button>
            </form>

            {evalResult && (
              <div style={{ marginTop: "14px", padding: "16px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--primary-soft)", border: "1px solid var(--primary-border)" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--primary)" }}>
                  Rubric Score: {evalResult.score}/100
                </h3>
                <p style={{ fontSize: "0.84rem", color: "var(--text-primary)", margin: "4px 0 8px" }}>
                  {evalResult.feedback}
                </p>
                {evalResult.strengths && (
                  <div style={{ fontSize: "0.8rem", color: "var(--text-primary)" }}>
                    <strong>Strengths:</strong> {evalResult.strengths.join(", ")}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
