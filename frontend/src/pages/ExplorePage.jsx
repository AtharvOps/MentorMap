import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getExploreTemplates, generatePathway, saveCourse } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { 
  Search, Star, Clock, ArrowRight 
} from "lucide-react";
import { toast } from "react-toastify";

const ExplorePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [templates, setTemplates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const curatedTracks = [
    {
      technology: "Complete Data Structures & Algorithms",
      goal: "Interview Prep",
      experience: "Beginner to Advanced",
      estimatedDuration: "10-12 weeks",
      topicCount: 28,
      difficulty: "Intermediate",
      category: "DSA",
      rating: 4.9,
      students: "32.4k",
      tagline: "Arrays, Linked Lists, Trees, Graphs, DP, Greedy, and FAANG Interview patterns."
    },
    {
      technology: "Full Stack Web Development",
      goal: "Job-ready",
      experience: "Beginner",
      estimatedDuration: "14-16 weeks",
      topicCount: 34,
      difficulty: "Beginner",
      category: "Full Stack",
      rating: 4.8,
      students: "41.2k",
      tagline: "HTML5, CSS3, JavaScript, React 18, Node.js, Express, MongoDB, REST APIs & JWT."
    },
    {
      technology: "System Design for High Scalability",
      goal: "Interview Prep",
      experience: "Intermediate",
      estimatedDuration: "8-10 weeks",
      topicCount: 20,
      difficulty: "Advanced",
      category: "System Design",
      rating: 4.9,
      students: "19.8k",
      tagline: "Load Balancers, Microservices, Caching (Redis), Database Sharding & CAP Theorem."
    },
    {
      technology: "Backend Engineering with Node.js & MongoDB",
      goal: "Job-ready",
      experience: "Intermediate",
      estimatedDuration: "10 weeks",
      topicCount: 22,
      difficulty: "Intermediate",
      category: "Backend",
      rating: 4.8,
      students: "15.6k",
      tagline: "Asynchronous Node.js, Mongoose ODM, Microservices, Authentication, and Docker."
    },
    {
      technology: "DevOps, Docker & Kubernetes",
      goal: "Certification & Industry",
      experience: "Intermediate",
      estimatedDuration: "12 weeks",
      topicCount: 24,
      difficulty: "Intermediate",
      category: "DevOps",
      rating: 4.8,
      students: "18.3k",
      tagline: "Containers, CI/CD Pipelines, Kubernetes Cluster Management, Helm & AWS EC2/EKS."
    },
    {
      technology: "AI & Machine Learning Foundations",
      goal: "Build AI Products",
      experience: "Intermediate",
      estimatedDuration: "12-14 weeks",
      topicCount: 26,
      difficulty: "Advanced",
      category: "AI/ML",
      rating: 4.9,
      students: "22.1k",
      tagline: "Python, NumPy, Pandas, Scikit-learn, Neural Networks, PyTorch & LLM APIs."
    },
    {
      technology: "Cybersecurity & Ethical Hacking",
      goal: "Security Mastery",
      experience: "Beginner",
      estimatedDuration: "10 weeks",
      topicCount: 18,
      difficulty: "Intermediate",
      category: "Security",
      rating: 4.7,
      students: "11.2k",
      tagline: "Network Security, Web Penetration Testing, OWASP Top 10, Cryptography & Linux."
    },
    {
      technology: "Database Management & Advanced SQL",
      goal: "Core Fundamentals",
      experience: "Beginner",
      estimatedDuration: "6 weeks",
      topicCount: 16,
      difficulty: "Beginner",
      category: "Backend",
      rating: 4.8,
      students: "27.5k",
      tagline: "Relational DBs, Complex Joins, Indexing, Transactions (ACID), and Normalization."
    }
  ];

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await getExploreTemplates();
        if (res.data && res.data.length > 0) {
          setTemplates(res.data);
        } else {
          setTemplates(curatedTracks);
        }
      } catch (_) {
        setTemplates(curatedTracks);
      }
    };
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnrollCourse = async (courseTrack) => {
    setLoading(true);
    try {
      const response = await generatePathway({
        technology: courseTrack.technology,
        goal: courseTrack.goal || "Mastery",
        experience: courseTrack.experience || "Beginner"
      });

      if (isAuthenticated) {
        const saveRes = await saveCourse({
          technology: courseTrack.technology,
          pathway: response.data.pathway,
          goal: courseTrack.goal || "Mastery",
          experience: courseTrack.experience || "Beginner",
          difficulty: courseTrack.difficulty || "Beginner",
          estimatedDuration: courseTrack.estimatedDuration
        });
        toast.success(`Enrolled in ${courseTrack.technology}!`);
        navigate(`/courses/${saveRes.data.pathway._id}`);
      } else {
        toast.info("Generated curriculum! Sign in to track your progress.");
      }
    } catch (err) {
      toast.error("Failed to enroll in course.");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", "DSA", "Full Stack", "Backend", "System Design", "DevOps", "AI/ML", "Security"];

  const courseList = templates.length > 0 ? templates : curatedTracks;

  const filtered = courseList.filter(item => {
    const matchesCat = selectedCategory === "All" || (item.category && item.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    const matchesSearch = item.technology.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.tagline && item.tagline.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", paddingBottom: "60px", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header & Filter Controls */}
      <div className="saas-card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Explore Developer Courses & Pathways</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: 0 }}>
              Structured, topic-wise technical curriculum with editorial notes and practice quizzes.
            </p>
          </div>

          {/* Search Box */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", backgroundColor: "var(--bg-input)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", minWidth: "260px" }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search courses or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: "none", border: "none", outline: "none", color: "var(--text-primary)", fontSize: "0.85rem", width: "100%" }}
            />
          </div>
        </div>

        {/* Category Filter Chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                border: `1px solid ${selectedCategory === cat ? "var(--primary)" : "var(--border)"}`,
                backgroundColor: selectedCategory === cat ? "var(--primary)" : "var(--bg-input)",
                color: selectedCategory === cat ? "#ffffff" : "var(--text-secondary)",
                fontWeight: 600,
                fontSize: "0.82rem",
                cursor: "pointer",
                transition: "all 0.1s ease"
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "18px" }}>
        {filtered.map((c, idx) => (
          <div key={idx} className="saas-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "14px", padding: "18px 20px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span className="badge-soft-primary">{c.category || "Course"}</span>
                <span className={c.difficulty === "Beginner" ? "badge-difficulty-easy" : c.difficulty === "Intermediate" ? "badge-difficulty-medium" : "badge-difficulty-hard"}>
                  {c.difficulty || "Intermediate"}
                </span>
              </div>

              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "6px" }}>
                {c.technology}
              </h3>
              <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "12px" }}>
                {c.tagline || c.description}
              </p>

              {/* Metadata */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.76rem", color: "var(--text-muted)", fontWeight: 600 }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={12} /> {c.estimatedDuration || "8-10 weeks"}
                </span>
                <span>•</span>
                <span>{c.topicCount || 20} Topics</span>
                <span>•</span>
                <span style={{ color: "#d97706", display: "flex", alignItems: "center", gap: "2px" }}>
                  <Star size={12} fill="#d97706" /> {c.rating || 4.8}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
              <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{c.students || "10k+"} Enrolled</span>
              <button
                onClick={() => handleEnrollCourse(c)}
                disabled={loading}
                className="btn-gfg-primary"
                style={{ padding: "6px 14px", fontSize: "0.8rem" }}
              >
                <span>Enroll Now</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExplorePage;
