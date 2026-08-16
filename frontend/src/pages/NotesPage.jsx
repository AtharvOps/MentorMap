import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { generateAINotes, saveStudyNote, getSavedNotes, deleteStudyNote } from "../services/api";
import { 
  FileText, Download, Bookmark, Search, 
  Trash2, RefreshCw, Check, BookOpen, Copy, CheckCheck 
} from "lucide-react";
import { toast } from "react-toastify";

const NotesPage = () => {
  const [searchParams] = useSearchParams();
  const initialTopic = searchParams.get("topic") || "";
  const initialTech = searchParams.get("tech") || "";

  const [topic, setTopic] = useState(initialTopic || "Binary Search Trees");
  const [technology, setTechnology] = useState(initialTech || "Data Structures");
  const [notesContent, setNotesContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedNotes, setSavedNotes] = useState([]);
  const [filterQuery, setFilterQuery] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const notesRef = useRef(null);

  const popularTopics = [
    { name: "Binary Search Trees", tech: "DSA" },
    { name: "Dynamic Programming Patterns", tech: "Algorithms" },
    { name: "React useEffect & Custom Hooks", tech: "Frontend" },
    { name: "Database Indexing (B-Trees)", tech: "DBMS" },
    { name: "Microservices & Load Balancing", tech: "System Design" },
    { name: "Async/Await & Event Loop", tech: "JavaScript" }
  ];

  const fetchSaved = async () => {
    try {
      const res = await getSavedNotes();
      setSavedNotes(res.data || []);
    } catch (_) {}
  };

  const handleGenerate = async (t = topic, tech = technology) => {
    if (!t.trim()) {
      toast.warning("Please enter a topic name.");
      return;
    }

    setLoading(true);
    setIsSaved(false);
    try {
      const response = await generateAINotes({ topic: t.trim(), technology: tech.trim() });
      if (response.data?.content) {
        setNotesContent(response.data.content);
        toast.success(`Generated notes for ${t.trim()}!`);
      } else {
        toast.error("No content returned for notes.");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to generate study notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
    if (initialTopic) {
      handleGenerate(initialTopic, initialTech);
    } else {
      handleGenerate("Binary Search Trees", "Data Structures");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTopic, initialTech]);

  const handleSaveNote = async () => {
    if (!notesContent) return;
    try {
      await saveStudyNote({
        topic,
        technology,
        content: notesContent
      });
      setIsSaved(true);
      toast.success("Study note saved to library!");
      fetchSaved();
    } catch (err) {
      toast.error("Failed to save note.");
    }
  };

  const handleCopyMarkdown = () => {
    if (!notesContent) return;
    navigator.clipboard.writeText(notesContent);
    setCopied(true);
    toast.success("Notes copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = async () => {
    if (!notesRef.current) return;
    try {
      toast.info("Preparing PDF export...");
      const canvas = await html2canvas(notesRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${topic.replace(/\s+/g, "_")}_GFG_Notes.pdf`);
      toast.success("PDF Downloaded!");
    } catch (err) {
      toast.error("Failed to export PDF.");
    }
  };

  const handleDeleteSaved = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteStudyNote(id);
      setSavedNotes(prev => prev.filter(n => n._id !== id));
      toast.success("Note removed from library.");
    } catch (_) {}
  };

  const filteredNotes = savedNotes.filter(n => 
    n.topic.toLowerCase().includes(filterQuery.toLowerCase()) || 
    (n.technology && n.technology.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingBottom: "60px" }}>
      {/* Top Generator Card */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Topic Input Bar */}
        <div className="saas-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <span className="badge-soft-primary">EDITORIAL STUDY NOTES</span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>13-Section Deep Technical Markdown</span>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "14px" }}>
            <input
              type="text"
              placeholder="Topic to study (e.g. Binary Search Trees, React Hooks, Dynamic Programming...)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={{
                flex: 2,
                minWidth: "220px",
                padding: "10px 16px",
                borderRadius: "var(--radius-sm)",
                border: "1.5px solid var(--border)",
                backgroundColor: "var(--bg-input)",
                color: "var(--text-primary)",
                outline: "none",
                fontSize: "0.96rem"
              }}
            />
            <input
              type="text"
              placeholder="Subject (e.g. DSA)"
              value={technology}
              onChange={(e) => setTechnology(e.target.value)}
              style={{
                flex: 1,
                minWidth: "120px",
                padding: "10px 16px",
                borderRadius: "var(--radius-sm)",
                border: "1.5px solid var(--border)",
                backgroundColor: "var(--bg-input)",
                color: "var(--text-primary)",
                outline: "none",
                fontSize: "0.96rem"
              }}
            />
            <button
              onClick={() => handleGenerate(topic, technology)}
              disabled={loading}
              className="btn-gfg-primary"
              style={{ padding: "10px 22px" }}
            >
              {loading ? <RefreshCw size={16} className="spin" /> : <BookOpen size={16} />}
              <span>{loading ? "Generating Notes..." : "Generate Notes"}</span>
            </button>
          </div>

          {/* Quick Popular Topic Pills */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 700 }}>Quick topics:</span>
            {popularTopics.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTopic(p.name);
                  setTechnology(p.tech);
                  handleGenerate(p.name, p.tech);
                }}
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-xs)",
                  padding: "4px 10px",
                  fontSize: "0.82rem",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  fontWeight: 500
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Rendered GFG Editorial Notes */}
        {loading ? (
          <div className="saas-card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <RefreshCw size={40} color="var(--primary)" className="spin" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "6px" }}>Generating Editorial Study Notes for "{topic}"</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.94rem", maxWidth: "480px", margin: "0 auto" }}>
              Writing 13-section technical guide with architectural mental models, step-by-step code, and interview cheat sheets...
            </p>
          </div>
        ) : notesContent ? (
          <div className="saas-card" style={{ padding: "32px 36px" }}>
            {/* Header Action Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "16px", marginBottom: "24px" }}>
              <div style={{ borderLeft: "5px solid var(--primary)", paddingLeft: "14px" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{topic}</h2>
                <span style={{ fontSize: "0.86rem", color: "var(--text-muted)", fontWeight: 600 }}>{technology} Documentation & Editorial Tutorial</span>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handleCopyMarkdown}
                  className="btn-secondary-gfg"
                  style={{ padding: "8px 14px", fontSize: "0.86rem" }}
                  title="Copy Raw Markdown"
                >
                  {copied ? <CheckCheck size={16} color="var(--primary)" /> : <Copy size={16} />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>

                <button
                  onClick={handleSaveNote}
                  className={isSaved ? "btn-gfg-primary" : "btn-outline-gfg"}
                  style={{ padding: "8px 16px", fontSize: "0.86rem" }}
                >
                  {isSaved ? <Check size={16} /> : <Bookmark size={16} />}
                  <span>{isSaved ? "Saved" : "Save Note"}</span>
                </button>

                <button
                  onClick={handleExportPDF}
                  className="btn-secondary-gfg"
                  style={{ padding: "8px 14px", fontSize: "0.86rem" }}
                >
                  <Download size={16} />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            {/* Markdown Body with larger readable font */}
            <div 
              ref={notesRef} 
              style={{ color: "var(--text-primary)", lineHeight: 1.75, fontSize: "1.05rem" }}
            >
              <ReactMarkdown>{notesContent}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="saas-card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <FileText size={44} color="var(--text-muted)" style={{ margin: "0 auto 14px" }} />
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "6px" }}>Enter any topic above to generate study notes</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", maxWidth: "460px", margin: "0 auto" }}>
              Generates structured tutorials with mental models, step-by-step code, analogies, and interview cheat sheets.
            </p>
          </div>
        )}
      </div>

      {/* ==========================
          RIGHT COLUMN: SAVED NOTES LIBRARY
          ========================== */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div className="saas-card" style={{ padding: "22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>Saved Study Notes</h3>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>{savedNotes.length} Notes</span>
          </div>

          {/* Search Library */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "var(--bg-input)", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", marginBottom: "16px" }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search library..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              style={{ background: "none", border: "none", outline: "none", fontSize: "0.9rem", color: "var(--text-primary)", width: "100%" }}
            />
          </div>

          {/* Notes List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "560px", overflowY: "auto" }}>
            {filteredNotes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)", fontSize: "0.88rem" }}>
                No saved notes found.
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note._id}
                  onClick={() => {
                    setTopic(note.topic);
                    setTechnology(note.technology || "");
                    setNotesContent(note.content);
                    setIsSaved(true);
                  }}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg-surface)",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.94rem", color: "var(--text-primary)" }}>
                      {note.topic}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      {note.technology || "General"} • {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteSaved(note._id, e)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}
                    title="Delete Note"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesPage;
