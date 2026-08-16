import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { generateAIQuiz, submitQuizAttempt, completeCourseStep } from "../services/api";
import { 
  CheckCircle, XCircle, 
  ArrowRight, RefreshCw, Award, AlertTriangle 
} from "lucide-react";
import { toast } from "react-toastify";

const QuizPage = () => {
  const [searchParams] = useSearchParams();
  const initialTopic = searchParams.get("topic") || "";
  const courseId = searchParams.get("courseId") || "";

  const navigate = useNavigate();

  const [topic, setTopic] = useState(initialTopic || "Binary Search");
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [confidenceLevel] = useState(3);

  const [quizState, setQuizState] = useState("CONFIG"); // "CONFIG" | "IN_PROGRESS" | "REVIEW"
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
    }
  }, [initialTopic]);

  const handleStartQuiz = async () => {
    if (!topic.trim()) {
      toast.warning("Please enter a topic.");
      return;
    }

    setLoading(true);
    try {
      const response = await generateAIQuiz({
        topic: topic.trim(),
        questionCount: Number(questionCount),
        difficulty
      });

      setQuestions(response.data.questions || []);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setQuizState("IN_PROGRESS");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to generate quiz.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (optionText) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIndex]: optionText
    }));
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = async () => {
    let correctCount = 0;
    const detectedMisconceptions = [];
    const answerLogs = [];

    questions.forEach((q, idx) => {
      const chosen = selectedAnswers[idx];
      const isCorrect = chosen === q.correctAnswer;
      if (isCorrect) correctCount++;

      let misNote = "";
      if (!isCorrect && q.misconceptions && q.misconceptions[chosen]) {
        misNote = q.misconceptions[chosen];
        detectedMisconceptions.push(misNote);
      }

      answerLogs.push({
        question: q.question,
        selectedAnswer: chosen || "Unanswered",
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
        misconceptionNote: misNote
      });
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);

    try {
      await submitQuizAttempt({
        topic,
        courseId: courseId || undefined,
        score: scorePercentage,
        totalQuestions: questions.length,
        correctAnswersCount: correctCount,
        confidenceLevel,
        answers: answerLogs,
        detectedMisconceptions
      });

      if (courseId && scorePercentage >= 60) {
        try {
          await completeCourseStep(courseId, {
            stepId: `topic-${topic}`,
            quizScore: scorePercentage
          });
        } catch (_) {}
      }

      setQuizState("REVIEW");
      toast.success(`Practice completed! Score: ${scorePercentage}%`);
    } catch (err) {
      setQuizState("REVIEW");
    }
  };

  const currentQ = questions[currentIndex];
  const currentSelected = selectedAnswers[currentIndex];

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", paddingBottom: "60px" }}>
      {/* ==========================
          STATE 1: CONFIGURATION
          ========================== */}
      {quizState === "CONFIG" && (
        <div className="saas-card" style={{ padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "14px" }}>
            <span className="badge-soft-primary">TOPIC ASSESSMENT</span>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Adaptive Multiple Choice & Conceptual Checks</span>
          </div>

          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "6px" }}>
            Practice Quiz: {topic}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "22px" }}>
            Validate your conceptual understanding. Analyzes answer patterns to detect gaps and misconceptions.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px" }}>
                TOPIC TO TEST
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)", outline: "none", fontSize: "0.92rem" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  NUMBER OF QUESTIONS
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)", outline: "none", fontSize: "0.86rem" }}
                >
                  <option value="5">5 Questions (Quick Test)</option>
                  <option value="10">10 Questions (Standard Check)</option>
                  <option value="15">15 Questions (Comprehensive)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  DIFFICULTY LEVEL
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)", outline: "none", fontSize: "0.86rem" }}
                >
                  <option value="Beginner">Easy (Foundations)</option>
                  <option value="Intermediate">Medium (Real-World Patterns)</option>
                  <option value="Advanced">Hard (Edge Cases & Optimization)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleStartQuiz}
              disabled={loading}
              className="btn-gfg-primary"
              style={{ width: "100%", padding: "11px", justifyContent: "center", marginTop: "8px", fontSize: "0.92rem" }}
            >
              {loading ? (
                <>
                  <RefreshCw size={15} className="spin" />
                  <span>Generating Assessment Questions...</span>
                </>
              ) : (
                <>
                  <span>Start Practice Quiz</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ==========================
          STATE 2: QUIZ IN PROGRESS
          ========================== */}
      {quizState === "IN_PROGRESS" && currentQ && (
        <div className="saas-card" style={{ padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span className="badge-soft-primary">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>
              {topic} • {difficulty}
            </span>
          </div>

          <div style={{ height: "5px", backgroundColor: "var(--bg-input)", borderRadius: "var(--radius-full)", marginBottom: "24px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${((currentIndex + 1) / questions.length) * 100}%`, backgroundColor: "var(--primary)", transition: "width 0.25s ease" }} />
          </div>

          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, lineHeight: 1.5, marginBottom: "20px", color: "var(--text-primary)" }}>
            {currentQ.question}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
            {currentQ.options.map((option, oIdx) => {
              const isSelected = currentSelected === option;
              return (
                <div
                  key={oIdx}
                  onClick={() => handleOptionSelect(option)}
                  style={{
                    padding: "14px 18px",
                    borderRadius: "var(--radius-sm)",
                    border: `1.5px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
                    backgroundColor: isSelected ? "var(--primary-soft)" : "var(--bg-surface)",
                    color: isSelected ? "var(--primary)" : "var(--text-primary)",
                    fontWeight: isSelected ? 700 : 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "0.9rem"
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "var(--radius-full)",
                      border: `2px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
                      backgroundColor: isSelected ? "var(--primary)" : "transparent"
                    }}
                  />
                  <span>{option}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleNextQuestion}
              disabled={!currentSelected}
              className="btn-gfg-primary"
              style={{ padding: "10px 24px", opacity: currentSelected ? 1 : 0.5 }}
            >
              <span>{currentIndex === questions.length - 1 ? "Submit & View Results" : "Next Question"}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ==========================
          STATE 3: REVIEW & MISCONCEPTIONS
          ========================== */}
      {quizState === "REVIEW" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="saas-card" style={{ padding: "28px", textAlign: "center" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "var(--radius-full)", backgroundColor: "var(--primary-soft)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <Award size={28} />
            </div>

            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "4px" }}>
              {Math.round((Object.keys(selectedAnswers).filter(i => selectedAnswers[i] === questions[i]?.correctAnswer).length / questions.length) * 100)}% Score
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "18px" }}>
              {Object.keys(selectedAnswers).filter(i => selectedAnswers[i] === questions[i]?.correctAnswer).length} of {questions.length} Correct Answers
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button
                onClick={() => setQuizState("CONFIG")}
                className="btn-gfg-primary"
              >
                <RefreshCw size={14} /> Retake Assessment
              </button>
              {courseId && (
                <button
                  onClick={() => navigate(`/courses/${courseId}`)}
                  className="btn-secondary-gfg"
                >
                  Back to Syllabus
                </button>
              )}
            </div>
          </div>

          {/* Breakdown List */}
          <div className="saas-card" style={{ padding: "24px" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "16px" }}>Detailed Diagnostic Review</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {questions.map((q, idx) => {
                const userChoice = selectedAnswers[idx];
                const isCorrect = userChoice === q.correctAnswer;
                const misNote = !isCorrect && q.misconceptions ? q.misconceptions[userChoice] : null;

                return (
                  <div 
                    key={idx} 
                    style={{
                      padding: "16px",
                      borderRadius: "var(--radius-sm)",
                      border: `1px solid ${isCorrect ? "var(--primary)" : "var(--danger)"}`,
                      backgroundColor: isCorrect ? "var(--primary-soft)" : "var(--danger-soft)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, fontSize: "0.86rem", marginBottom: "6px", color: isCorrect ? "var(--primary)" : "var(--danger)" }}>
                      {isCorrect ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      <span>Question {idx + 1}</span>
                    </div>

                    <div style={{ fontWeight: 600, fontSize: "0.92rem", color: "var(--text-primary)", marginBottom: "10px" }}>
                      {q.question}
                    </div>

                    <div style={{ fontSize: "0.84rem", color: "var(--text-secondary)", marginBottom: "2px" }}>
                      <strong>Your Answer:</strong> {userChoice || "None"}
                    </div>
                    {!isCorrect && (
                      <div style={{ fontSize: "0.84rem", color: "var(--primary)", fontWeight: 700, marginBottom: "6px" }}>
                        <strong>Correct Answer:</strong> {q.correctAnswer}
                      </div>
                    )}

                    {misNote && (
                      <div style={{ marginTop: "8px", padding: "10px 12px", borderRadius: "var(--radius-sm)", backgroundColor: "var(--bg-surface)", border: "1px solid var(--warning)", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                        <AlertTriangle size={16} color="var(--warning)" style={{ flexShrink: 0, marginTop: "2px" }} />
                        <div style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                          <strong>Misconception Detected:</strong> {misNote}
                        </div>
                      </div>
                    )}

                    {q.explanation && (
                      <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "6px" }}>
                        <em>Explanation:</em> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
