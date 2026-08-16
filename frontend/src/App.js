import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/theme.css";

// Layout
import AppShell from "./layouts/AppShell";

// Pages
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import RoadmapDetailPage from "./pages/RoadmapDetailPage";
import ExplorePage from "./pages/ExplorePage";
import NotesPage from "./pages/NotesPage";
import QuizPage from "./pages/QuizPage";
import TutorPage from "./pages/TutorPage";
import ExplainBackPage from "./pages/ExplainBackPage";
import LabPage from "./pages/LabPage";
import ProjectsPage from "./pages/ProjectsPage";
import InterviewPage from "./pages/InterviewPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import AboutPage from "./pages/AboutPage";

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading MentorMap...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function AppContent() {
  return (
    <Router>
      <AppShell>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* AI & Practice Modules */}
          <Route path="/tutor" element={<TutorPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/quizzes" element={<QuizPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/explain/:topicId" element={<ExplainBackPage />} />
          <Route path="/explain" element={<ExplainBackPage />} />
          <Route path="/lab/:topicId" element={<LabPage />} />
          <Route path="/lab" element={<LabPage />} />
          <Route path="/interview" element={<InterviewPage />} />

          {/* Protected Learning Dashboard & Roadmap Views */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/roadmaps" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/courses/:id" element={<ProtectedRoute><RoadmapDetailPage /></ProtectedRoute>} />
          <Route path="/roadmaps/:id" element={<ProtectedRoute><RoadmapDetailPage /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/share/:id" element={<ProfilePage />} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
