

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Button, Card, Alert, Form, ProgressBar } from "react-bootstrap";
import "./Quiz.css";

const GOOGLE_GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GOOGLE_GEMINI_API_URL = process.env.REACT_APP_GEMINI_API_URL || "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


const Quiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizData, courseId, sectionIndex, stepIndex, topic } = location.state || {};
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError(null);
  
        if (quizData && Array.isArray(quizData) && quizData.length > 0) {
          setQuestions(quizData);
          setLoading(false);
          return;
        }
  
        if (!topic) {
          setError("No topic provided for the quiz.");
          setLoading(false);
          return;
        }
  
        const response = await axios.post(
          `${GOOGLE_GEMINI_API_URL}?key=${GOOGLE_GEMINI_API_KEY}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: `Generate a multiple-choice quiz on ${topic} with 5 questions. 
                    Each question should have four answer choices and indicate the correct answer. 
                    Format the response as a JSON array of objects, where each object has:
                    {
                      "question": "Question text",
                      "options": ["Answer 1", "Answer 2", "Answer 3", "Answer 4"],
                      "correctAnswer": "Correct answer text"
                    }`,
                  },
                ],
              },
            ],
          }
        );
  
        const quizDataString = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  
        if (quizDataString) {
          try {
            const jsonString = quizDataString.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsedQuestions = JSON.parse(jsonString);
            setQuestions(parsedQuestions);
          } catch (error) {
            console.error("Error parsing quiz data:", error);
            setError("Failed to parse quiz questions. Please try again.");
          }
        } else {
          setError("No quiz questions were generated. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching quiz questions:", error);
        setError("Failed to load quiz. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
  
    if (quizData || topic) {
      fetchQuiz();
    } else {
      setError("No quiz data or topic found.");
      setLoading(false);
    }
  }, [topic, quizData]);

  const handleAnswerClick = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = async () => {
    const newAnswer = {
      question: questions[currentQuestion].question,
      selectedAnswer: selectedAnswer,
      correctAnswer: questions[currentQuestion].correctAnswer,
      isCorrect: selectedAnswer === questions[currentQuestion].correctAnswer
    };

    setUserAnswers([...userAnswers, newAnswer]);

    if (newAnswer.isCorrect) {
      setScore(score + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setQuizCompleted(true);
      // `${API_BASE_URL}/api/signup`, 
      
      if (courseId && sectionIndex !== undefined && stepIndex !== undefined) {
        try {
          const token = localStorage.getItem("token");
          await axios.post(
            `${API_BASE_URL}/courses/${courseId}/complete-step`,
            { sectionIndex, stepIndex, quizScore: score },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              withCredentials: true,
            }
          );
        } catch (error) {
          console.error("Failed to update course progress:", error);
        }
      }
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizCompleted(false);
    setUserAnswers([]);
  };

  const handleReturnToPathway = () => {
    navigate(`/courses/${courseId}`);
  };

  if (loading) {
    return (
      <div className="quiz-loading-container">
        <div className="quiz-spinner"></div>
        <p>Preparing your quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-error-container">
        <Card className="quiz-error-card">
          <h3>Error Loading Quiz</h3>
          <p>{error}</p>
          <Button 
            variant="primary" 
            onClick={() => window.location.reload()}
            className="quiz-error-button"
          >
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="quiz-completed-container">
        <Card className="quiz-completed-card">
          <h2 className="quiz-completed-title">Quiz Completed!</h2>
          
          <div className="quiz-score-container">
            <ProgressBar 
              now={(score / questions.length) * 100} 
              label={`${score}/${questions.length}`} 
              variant={score === questions.length ? "success" : score > questions.length/2 ? "info" : "danger"}
            />
            <h4 className="quiz-score-text">
              Score: {score} out of {questions.length} ({Math.round((score / questions.length) * 100)}%)
            </h4>
          </div>

          <div className="quiz-answers-container">
            <h3>Your Answers:</h3>
            {userAnswers.map((answer, index) => (
              <div 
                key={index} 
                className={`quiz-answer-card ${answer.isCorrect ? 'correct' : 'incorrect'}`}
              >
                <h5>Question {index + 1}: {answer.question}</h5>
                <p className="quiz-answer-text">
                  <span>Your answer: </span>
                  <span className={answer.isCorrect ? 'correct-text' : 'incorrect-text'}>
                    {answer.selectedAnswer}
                  </span>
                </p>
                {!answer.isCorrect && (
                  <p className="quiz-correct-answer">
                    Correct answer: {answer.correctAnswer}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="quiz-completed-buttons">
            <Button variant="outline-primary" onClick={handleRestartQuiz}>
              Retake Quiz
            </Button>
            {courseId ? (
              <Button variant="primary" onClick={handleReturnToPathway}>
                Return to Pathway
              </Button>
            ) : (
              <Button variant="primary" onClick={() => navigate("/")}>
                Return to Dashboard
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="quiz-main-container">
      <Card className="quiz-question-card">
        <div className="quiz-header">
          <h2 className="quiz-topic">{topic}</h2>
          <div className="quiz-progress">
            Question {currentQuestion + 1} of {questions.length}
          </div>
        </div>

        <div className="quiz-question-container">
          <h3 className="quiz-question-text">
            {questions[currentQuestion]?.question}
          </h3>
        </div>

        <div className="quiz-options-container">
          {questions[currentQuestion]?.options.map((option, index) => (
            <Button
              key={index}
              variant={selectedAnswer === option ? "primary" : "outline-secondary"}
              className={`quiz-option ${selectedAnswer === option ? 'selected' : ''}`}
              onClick={() => handleAnswerClick(option)}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}.</span>
              <span className="option-text">{option}</span>
            </Button>
          ))}
        </div>

        {selectedAnswer && (
          <div className="quiz-navigation">
            <Button 
              variant="success" 
              onClick={handleNextQuestion}
              className="quiz-next-button"
            >
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Quiz;


