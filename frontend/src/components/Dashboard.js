import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import "./Dashboard.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("You are not authenticated. Please log in.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/courses/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        setCourses(response.data);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch courses. Please try again later.");
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const getRingColorClass = (progress) => {
    const p = Number(progress) || 0;
    if (p <= 20) return "red";
    if (p <= 40) return "yellow";
    if (p <= 70) return "lightgreen";
    return "green";
  };

  const cardColors = [
    "#4f46e5", "#0ea5e9", "#10b981", "#8b5cf6", 
    "#f59e0b", "#ec4899", "#06b6d4", "#3b82f6"
  ];

  const getCardColor = (index) => {
    return cardColors[index % cardColors.length];
  };

  const handleDelete = async (courseId) => {
    if (window.confirm("⚠️ Are you sure you want to delete this course? This action cannot be undone!")) {
      try {
        await axios.delete(`${API_BASE_URL}/courses/${courseId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setCourses((prevCourses) => prevCourses.filter(course => course._id !== courseId));
      } catch (error) {
        alert("❌ Failed to delete the course. Please try again later.");
      }
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading your learnings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/login")}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="title mb-0">My Learnings</h2>
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          + New Pathway
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-5 my-4 bg-light rounded-3 shadow-sm border p-4">
          <h4 className="text-secondary mb-3">No saved pathways yet!</h4>
          <p className="text-muted mb-4">
            You haven't saved any learning pathways to your dashboard yet.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate("/")}>
            🚀 Generate Your First Pathway
          </button>
        </div>
      ) : (
        <div className="row">
          {courses.map((course, index) => {
            const progress = Number(course.progress) || 0;
            return (
              <div key={course._id || index} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4 d-flex">
                <div className="card learning-card text-center p-4 w-100 shadow-sm" style={{ backgroundColor: getCardColor(index) }}>
                  <h5 className="card-title text-white h4 text-capitalize mb-3">{course.technology}</h5>
                  <div className="progress-circle">
                    <svg width="100" height="100" viewBox="0 0 100 100" className="progress-ring">
                      <circle className="progress-bg" cx="50" cy="50" r="40" />
                      <circle
                        className={`progress-bar ${getRingColorClass(progress)}`}
                        cx="50"
                        cy="50"
                        r="40"
                        strokeDasharray="251.2"
                        strokeDashoffset={`${251.2 - (251.2 * progress) / 100}`}
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                      <text x="50" y="50" textAnchor="middle" className="progress-text" dy="0.3em">
                        {progress}%
                      </text>
                    </svg>
                  </div>
                  <div className="button-group mt-3 d-flex justify-content-between align-items-center">
                    <button className="delete-button" onClick={() => handleDelete(course._id)} title="Delete Pathway">
                      <FontAwesomeIcon icon={faTrash} style={{ color: "#ff4d4d", fontSize: "20px" }} />
                    </button>
                    <button className="start-button btn btn-light font-weight-bold" onClick={() => navigate(`/courses/${course._id}`)}>
                      {progress > 0 ? "Continue" : "Start"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

