import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as d3 from "d3";
import { getCourseById, updateCourseProgress } from "../services/api";
import { 
  CheckCircle, Circle, BookOpen, BrainCircuit, 
  ArrowLeft, Layers, List, X, 
  Search, ZoomIn, ZoomOut, RotateCcw, Maximize2 
} from "lucide-react";
import { toast } from "react-toastify";

const RoadmapDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [progress, setProgress] = useState(0);
  const [viewMode, setViewMode] = useState("graph"); // "graph" | "table"
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [nodeSearch, setNodeSearch] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await getCourseById(id);
        const fetched = response.data;
        setCourse(fetched);
        setProgress(Number(fetched.progress) || 0);

        if (fetched.completedSteps && Array.isArray(fetched.completedSteps)) {
          setCompletedSteps(new Set(fetched.completedSteps));
        } else if (fetched.pathway) {
          const steps = getPathwaySteps(fetched.pathway);
          const total = steps.length || 1;
          const count = Math.round(((Number(fetched.progress) || 0) / 100) * total);
          const set = new Set();
          steps.slice(0, count).forEach(s => set.add(s.id));
          setCompletedSteps(set);
        }
      } catch (err) {
        toast.error("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const getModules = (pathway) => {
    if (!pathway) return [];
    const raw = Array.isArray(pathway) ? pathway : (pathway.stages || pathway.children || []);
    
    return raw.map((section, sIdx) => {
      const items = section.children || [];
      const topics = items.length > 0 ? items.map((child, cIdx) => ({
        id: `${sIdx}-${cIdx}`,
        name: child.name || child.title || `Topic ${cIdx + 1}`,
        description: child.description || "",
        why: child.why || "",
        difficulty: child.difficulty || "Intermediate",
        estimatedMinutes: child.estimatedMinutes || 45,
        keyConcepts: child.keyConcepts || [],
        resources: child.resources || [],
        sectionIndex: sIdx,
        stepIndex: cIdx
      })) : [
        {
          id: `${sIdx}-0`,
          name: section.name || section.title,
          description: section.description || "",
          why: section.why || "",
          difficulty: section.difficulty || "Intermediate",
          estimatedMinutes: 45,
          keyConcepts: [],
          resources: [],
          sectionIndex: sIdx,
          stepIndex: 0
        }
      ];

      return {
        moduleIndex: sIdx + 1,
        title: section.name || section.title || `Module ${sIdx + 1}`,
        description: section.description || "",
        topics
      };
    });
  };

  const getPathwaySteps = (pathway) => {
    const modules = getModules(pathway);
    const steps = [];
    modules.forEach(m => m.topics.forEach(t => steps.push(t)));
    return steps;
  };

  const handleToggleStep = async (stepId) => {
    const updated = new Set(completedSteps);
    if (updated.has(stepId)) updated.delete(stepId);
    else updated.add(stepId);

    const steps = getPathwaySteps(course.pathway);
    const total = steps.length || 1;
    const newProgress = Math.round((updated.size / total) * 100);

    setCompletedSteps(updated);
    setProgress(newProgress);

    try {
      await updateCourseProgress(id, {
        progress: newProgress,
        completedSteps: Array.from(updated)
      });
      if (newProgress === 100) {
        toast.success("🎉 Outstanding! You have completed the entire course curriculum!");
      }
    } catch (err) {
      toast.error("Failed to sync progress");
    }
  };

  // ==========================
  // D3 EXTENDED KNOWLEDGE GRAPH (ZOOM, PAN, EXPAND/COLLAPSE)
  // ==========================
  useEffect(() => {
    if (!course || !course.pathway || viewMode !== "graph" || !svgRef.current) return;

    const data = course.pathway.name 
      ? course.pathway 
      : { 
          name: `${course.technology} Knowledge Graph`, 
          children: course.pathway.stages || course.pathway.children || [] 
        };

    const width = 1100;
    const dx = 50;
    const dy = 260;

    const tree = d3.tree().nodeSize([dx, dy]);
    const root = d3.hierarchy(data);

    root.x0 = 0;
    root.y0 = 0;

    // Collapse children initially beyond depth 1 to allow progressive expansion
    if (root.children) {
      root.children.forEach(collapseBranch);
    }

    function collapseBranch(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapseBranch);
        if (d.depth > 1) {
          d.children = null;
        }
      }
    }

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [-50, -dx * 4, width + 200, dx * 16])
      .attr("style", "width: 100%; height: 580px; font: 13px var(--font-sans); user-select: none;");

    svg.selectAll("*").remove();

    // Add Zoom & Pan Behavior
    const zoomGroup = svg.append("g");

    const zoom = d3.zoom()
      .scaleExtent([0.4, 2.5])
      .on("zoom", (event) => {
        zoomGroup.attr("transform", event.transform);
      });

    svg.call(zoom);

    const gLink = zoomGroup.append("g")
      .attr("fill", "none")
      .attr("stroke", "var(--border)")
      .attr("stroke-opacity", 0.9)
      .attr("stroke-width", 2);

    const gNode = zoomGroup.append("g")
      .attr("cursor", "pointer")
      .attr("pointer-events", "all");

    function update(source) {
      const nodes = root.descendants().reverse();
      const links = root.links();

      tree(root);

      let left = root;
      let right = root;
      root.eachBefore(node => {
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
      });

      const transition = svg.transition()
        .duration(350);

      const node = gNode.selectAll("g")
        .data(nodes, d => d.id || (d.id = Math.random()));

      const nodeEnter = node.enter().append("g")
        .attr("transform", () => `translate(${source.y0 || 0},${source.x0 || 0})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0)
        .on("click", (event, d) => {
          if (d.children) {
            d._children = d.children;
            d.children = null;
          } else if (d._children) {
            d.children = d._children;
            d._children = null;
          }
          if (d.depth > 0) {
            setSelectedTopic({
              name: d.data.name || d.data.title,
              description: d.data.description || "",
              why: d.data.why || "",
              estimatedMinutes: d.data.estimatedMinutes || 45,
              keyConcepts: d.data.keyConcepts || [],
              resources: d.data.resources || []
            });
          }
          update(d);
        });

      // Node Circle
      nodeEnter.append("circle")
        .attr("r", d => d.depth === 0 ? 10 : d.depth === 1 ? 8 : 6)
        .attr("fill", d => {
          if (d.depth === 0) return "var(--primary)";
          if (d._children) return "var(--warning)";
          return "var(--bg-surface)";
        })
        .attr("stroke", "var(--primary)")
        .attr("stroke-width", 2.5);

      // Node Label
      nodeEnter.append("text")
        .attr("dy", "0.32em")
        .attr("x", d => d._children || d.children ? -12 : 12)
        .attr("text-anchor", d => d._children || d.children ? "end" : "start")
        .text(d => d.data.name || d.data.title)
        .attr("fill", "var(--text-primary)")
        .attr("font-weight", d => d.depth <= 1 ? "800" : "600")
        .attr("font-size", d => d.depth === 0 ? "15px" : d.depth === 1 ? "14px" : "13px")
        .clone(true).lower()
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 4)
        .attr("stroke", "var(--bg-card)");

      node.merge(nodeEnter).transition(transition)
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .attr("fill-opacity", 1)
        .attr("stroke-opacity", 1);

      node.exit().transition(transition).remove()
        .attr("transform", () => `translate(${source.y},${source.x})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0);

      const link = gLink.selectAll("path")
        .data(links, d => d.target.id);

      const linkEnter = link.enter().append("path")
        .attr("d", () => {
          const o = { x: source.x0 || 0, y: source.y0 || 0 };
          return d3.linkHorizontal().x(d => d.y).y(d => d.x)({ source: o, target: o });
        });

      link.merge(linkEnter).transition(transition)
        .attr("d", d3.linkHorizontal().x(d => d.y).y(d => d.x));

      link.exit().transition(transition).remove()
        .attr("d", () => {
          const o = { x: source.x, y: source.y };
          return d3.linkHorizontal().x(d => d.y).y(d => d.x)({ source: o, target: o });
        });

      root.eachBefore(d => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    update(root);
  }, [course, viewMode]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) containerRef.current.requestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  if (loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)", fontSize: "1.1rem" }}>
        Loading extensive knowledge graph...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="saas-card" style={{ textAlign: "center", padding: "40px" }}>
        <h3>Course Pathway Not Found</h3>
        <button onClick={() => navigate("/dashboard")} className="btn-gfg-primary" style={{ marginTop: "12px" }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const modules = getModules(course.pathway);
  const totalStepsCount = getPathwaySteps(course.pathway).length;

  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: "22px", paddingBottom: "60px" }}>
      {/* Breadcrumbs & View Mode Toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
        <button 
          onClick={() => navigate("/dashboard")} 
          style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontWeight: 700, fontSize: "0.95rem" }}
        >
          <ArrowLeft size={18} /> Back to My Courses
        </button>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setViewMode("graph")}
            className={viewMode === "graph" ? "btn-gfg-primary" : "btn-secondary-gfg"}
            style={{ padding: "8px 16px", fontSize: "0.9rem" }}
          >
            <Layers size={16} /> Extended Knowledge Graph
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={viewMode === "table" ? "btn-gfg-primary" : "btn-secondary-gfg"}
            style={{ padding: "8px 16px", fontSize: "0.9rem" }}
          >
            <List size={16} /> Structured Syllabus Table
          </button>
        </div>
      </div>

      {/* Course Overview Header Card */}
      <div className="saas-card" style={{ padding: "24px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span className="badge-soft-primary">{course.goal || "Mastery"}</span>
              <span className={course.difficulty === "Beginner" ? "badge-difficulty-easy" : course.difficulty === "Intermediate" ? "badge-difficulty-medium" : "badge-difficulty-hard"}>
                {course.difficulty || "Beginner"}
              </span>
              <span style={{ fontSize: "0.86rem", color: "var(--text-muted)", fontWeight: 600 }}>{course.estimatedDuration || "8-10 weeks"}</span>
            </div>

            <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>{course.technology} Extended Knowledge Graph</h1>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--primary)" }}>{progress}%</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>{completedSteps.size} of {totalStepsCount} Subtopics Completed</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ height: "7px", backgroundColor: "var(--bg-input)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, backgroundColor: "var(--primary)", transition: "width 0.3s ease" }} />
        </div>
      </div>

      {/* View Mode: Extended D3 Knowledge Graph vs GFG Table */}
      {viewMode === "graph" ? (
        <div className="saas-card" style={{ padding: "20px", position: "relative", overflow: "hidden" }}>
          {/* Controls toolbar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "0.88rem", fontWeight: 600 }}>
              <span>💡 Click any parent node (orange) to expand subtopics. Click any topic to open study notes & tests.</span>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={toggleFullscreen}
                className="btn-secondary-gfg"
                style={{ padding: "6px 10px", fontSize: "0.8rem" }}
                title="Toggle Fullscreen View"
              >
                <Maximize2 size={14} /> Fullscreen
              </button>
            </div>
          </div>

          <svg ref={svgRef} />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {modules.map((mod, mIdx) => (
            <div key={mIdx} className="saas-card" style={{ padding: "0", overflow: "hidden" }}>
              {/* Module Header */}
              <div style={{ padding: "16px 24px", backgroundColor: "var(--bg-input)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 800, textTransform: "uppercase" }}>
                    MODULE {mod.moduleIndex}
                  </span>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "2px 0 0" }}>{mod.title}</h3>
                </div>
                <span style={{ fontSize: "0.86rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  {mod.topics.length} Subtopics
                </span>
              </div>

              {/* Topics List Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <tbody>
                  {mod.topics.map((topic, tIdx) => {
                    const isDone = completedSteps.has(topic.id);
                    return (
                      <tr 
                        key={topic.id}
                        style={{
                          borderBottom: tIdx === mod.topics.length - 1 ? "none" : "1px solid var(--border)",
                          backgroundColor: isDone ? "var(--primary-soft)" : "transparent"
                        }}
                      >
                        <td style={{ padding: "14px 20px", width: "40px" }}>
                          <button
                            onClick={() => handleToggleStep(topic.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: isDone ? "var(--primary)" : "var(--text-muted)", display: "flex" }}
                            title={isDone ? "Mark as Incomplete" : "Mark as Completed"}
                          >
                            {isDone ? <CheckCircle size={20} /> : <Circle size={20} />}
                          </button>
                        </td>

                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ fontWeight: 700, fontSize: "0.98rem", color: "var(--text-primary)" }}>
                            {topic.name}
                          </div>
                          {topic.description && (
                            <div style={{ fontSize: "0.84rem", color: "var(--text-muted)", marginTop: "2px" }}>
                              {topic.description}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: "14px 20px", fontSize: "0.86rem", color: "var(--text-secondary)", width: "90px" }}>
                          {topic.estimatedMinutes}m
                        </td>

                        <td style={{ padding: "14px 20px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "8px" }}>
                            <button
                              onClick={() => navigate(`/notes?topic=${encodeURIComponent(topic.name)}&tech=${encodeURIComponent(course.technology)}`)}
                              className="btn-outline-gfg"
                              style={{ padding: "5px 12px", fontSize: "0.82rem" }}
                            >
                              Notes
                            </button>

                            <button
                              onClick={() => navigate(`/quizzes?topic=${encodeURIComponent(topic.name)}&courseId=${id}`)}
                              className="btn-secondary-gfg"
                              style={{ padding: "5px 12px", fontSize: "0.82rem" }}
                            >
                              Quiz
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Quick Topic Details Drawer */}
      {selectedTopic && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            maxWidth: "440px",
            backgroundColor: "var(--bg-surface)",
            borderLeft: "1px solid var(--border)",
            boxShadow: "var(--shadow-lg)",
            zIndex: 10000,
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <span className="badge-soft-primary">CONCEPT NODE DETAILS</span>
            <button 
              onClick={() => setSelectedTopic(null)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
            >
              <X size={20} />
            </button>
          </div>

          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "8px" }}>{selectedTopic.name}</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.94rem", lineHeight: 1.6, marginBottom: "24px" }}>
            {selectedTopic.description || "Master core mental models, algorithms, and architectural patterns for this concept node."}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "auto" }}>
            <button
              onClick={() => navigate(`/notes?topic=${encodeURIComponent(selectedTopic.name)}&tech=${encodeURIComponent(course.technology)}`)}
              className="btn-gfg-primary"
              style={{ justifyContent: "center", padding: "12px" }}
            >
              <BookOpen size={16} /> Editorial Study Notes
            </button>

            <button
              onClick={() => navigate(`/quizzes?topic=${encodeURIComponent(selectedTopic.name)}&courseId=${id}`)}
              className="btn-outline-gfg"
              style={{ justifyContent: "center", padding: "12px" }}
            >
              <BrainCircuit size={16} /> Adaptive Practice Quiz
            </button>

            <button
              onClick={() => navigate(`/explain/${encodeURIComponent(selectedTopic.name)}`)}
              className="btn-secondary-gfg"
              style={{ justifyContent: "center", padding: "12px" }}
            >
              Feynman Explain-Back Mode
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapDetailPage;
