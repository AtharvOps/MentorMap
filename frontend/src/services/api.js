import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || (typeof window !== "undefined" && window.location.hostname !== "localhost" ? "/api" : "http://localhost:5000/api");

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" }
});

// Automatically attach Bearer token to outgoing requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// =======================
// 🔹 AUTH API
// =======================
export const loginUser = (data) => client.post("/login", data);
export const signupUser = (data) => client.post("/signup", data);
export const getUserProfile = () => client.get("/user");
export const updateUserPreferences = (data) => client.put("/user/preferences", data);
export const updateLearnerTwinPreferences = (data) => client.put("/twin/preferences", data);

// =======================
// 🔹 PATHWAYS & COURSES
// =======================
export const generatePathway = (payload) => client.post("/pathways/generate", payload);
export const getExploreTemplates = () => client.get("/pathways/templates");
export const saveCourse = (payload) => client.post("/courses/save", payload);
export const getCourses = () => client.get("/courses");
export const getCourseById = (id) => client.get(`/courses/${id}`);
export const updateCourseProgress = (id, data) => client.put(`/courses/${id}/progress`, data);
export const completeCourseStep = (id, data) => client.post(`/courses/${id}/complete-step`, data);
export const deleteCourse = (id) => client.delete(`/courses/${id}`);

// =======================
// 🔹 AI INTELLIGENCE APIs
// =======================
export const generateAINotes = (data) => client.post("/ai/notes", data);
export const generateAIQuiz = (data) => client.post("/ai/quiz", data);
export const sendTutorMessage = (data) => client.post("/ai/tutor", data);
export const chatWithTutor = (data) => client.post("/ai/tutor", data);
export const evaluateExplainBack = (data) => client.post("/ai/explain", data);
export const requestAICodeReview = (data) => client.post("/ai/code-review", data);
export const getDebugChallenge = (data) => client.post("/ai/debug-challenge", data);
export const generateAIProject = (data) => client.post("/ai/project/generate", data);
export const generateProjectMission = (data) => client.post("/ai/project/generate", data);
export const evaluateAIProject = (data) => client.post("/ai/project/evaluate", data);
export const evaluateProjectSubmission = (id, data) => client.post(`/projects/${id}/evaluate`, data);
export const getInterviewQuestion = (data) => client.post("/ai/interview/question", data);
export const evaluateInterviewAnswer = (data) => client.post("/ai/interview/evaluate", data);
export const simulateInterviewTurn = (data) => client.post("/ai/interview/turn", data);

// =======================
// 🔹 LEARNING TWIN & ANALYTICS
// =======================
export const getLearningTwin = () => client.get("/twin");
export const getSmartNextAction = () => client.get("/twin/next-action");
export const logLearningActivity = (data) => client.post("/twin/activity", data);
export const getAnalyticsSummary = () => client.get("/analytics/summary");
export const getActivityHeatmap = () => client.get("/analytics/heatmap");
export const getActivityLogs = () => client.get("/analytics/heatmap");
export const getSkillPassport = () => client.get("/analytics/passport");
export const getPublicPassport = (userId) => client.get(`/analytics/public/${userId}`);

// =======================
// 🔹 NOTES LIBRARY
// =======================
export const getSavedNotes = () => client.get("/notes");
export const saveStudyNote = (data) => client.post("/notes", data);
export const toggleFavoriteNote = (id) => client.put(`/notes/${id}/favorite`);
export const deleteStudyNote = (id) => client.delete(`/notes/${id}`);

// =======================
// 🔹 QUIZZES
// =======================
export const submitQuizAttempt = (data) => client.post("/quizzes/submit", data);
export const getQuizHistory = () => client.get("/quizzes/history");

// =======================
// 🔹 PROJECTS
// =======================
export const getProjects = () => client.get("/projects");
export const getUserProjects = () => client.get("/projects");
export const saveUserProject = (data) => client.post("/projects", data);
export const updateUserProject = (id, data) => client.put(`/projects/${id}`, data);
export const deleteUserProject = (id) => client.delete(`/projects/${id}`);

// =======================
// 🔹 ACHIEVEMENTS
// =======================
export const getAchievements = () => client.get("/achievements");

export default client;
