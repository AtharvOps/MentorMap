
// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import ReactMarkdown from "react-markdown";
// import { ProgressBar } from "react-bootstrap";
// import "./CoursePathway.css";


// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;



// const CoursePathway = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [course, setCourse] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [progress, setProgress] = useState(0);
//   const [completedSteps, setCompletedSteps] = useState(new Set());

//   useEffect(() => {
//     const fetchCourse = async () => {
//       setLoading(true);
//       setError("");
//       setCourse(null);
//       setProgress(0);
//       setCompletedSteps(new Set());

//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           setError("You are not authenticated. Please log in.");
//           setLoading(false);
//           return;
//         }

//         //`${API_BASE_URL}/signup`, 

//         const response = await axios.get(
//           `${API_BASE_URL}/courses/${id}`,
//           {
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//             withCredentials: true,
//           }
//         );

//         let fetchedCourse = response.data;
//         if (Array.isArray(fetchedCourse) && fetchedCourse.length > 0) {
//           fetchedCourse = fetchedCourse[0];
//         }

//         setCourse(fetchedCourse);
//         setProgress(fetchedCourse.progress || 0);

//         if (fetchedCourse.pathway) {
//           const totalSteps = fetchedCourse.pathway.reduce(
//             (acc, section) => acc + section.children.length,
//             0
//           );
//           const completedCount = Math.round((fetchedCourse.progress / 100) * totalSteps);
          
//           const newCompletedSteps = new Set();
//           let stepsProcessed = 0;
          
//           fetchedCourse.pathway.forEach((section, sectionIndex) => {
//             section.children.forEach((_, stepIndex) => {
//               if (stepsProcessed < completedCount) {
//                 newCompletedSteps.add(`${sectionIndex}-${stepIndex}`);
//                 stepsProcessed++;
//               }
//             });
//           });

//           setCompletedSteps(newCompletedSteps);
//         }
//       } catch (error) {
//         setError(error.response?.data?.message || "Failed to fetch course.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCourse();
//   }, [id]);

//   const handleStepClick = async (sectionIndex, stepIndex) => {
//     if (!course) return;

//     try {
//       const stepId = `${sectionIndex}-${stepIndex}`;
//       const newCompletedSteps = new Set(completedSteps);

//       if (newCompletedSteps.has(stepId)) {
//         newCompletedSteps.delete(stepId);
//       } else {
//         newCompletedSteps.add(stepId);
//       }

//       const totalSteps = course.pathway.reduce(
//         (acc, section) => acc + section.children.length,
//         0
//       );
//       const newProgress = Math.round((newCompletedSteps.size / totalSteps) * 100);

//       setCompletedSteps(newCompletedSteps);
//       setProgress(newProgress);

//       const token = localStorage.getItem("token");
//       await axios.put(
//         `${API_BASE_URL}/courses/${id}/progress`,
//         {
//           progress: newProgress,
//           completedSteps: Array.from(newCompletedSteps),
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           withCredentials: true,
//         }
//       );
//     } catch (error) {
//       console.error("Progress update failed:", error);
//       setError("Failed to save progress. Please try again.");
//     }
//   };

//   const handleQuizClick = (child, sectionIndex, stepIndex) => {
//     navigate("/quiz", {
//       state: {
//         topic: child.name,
//         quizData: child.quiz || [],
//         courseId: id,
//         sectionIndex,
//         stepIndex,
//       },
//     });
//   };

//   const handleResourcesClick = (topic) => {
//     const searchQuery = encodeURIComponent(topic.trim());
//     const searchURL = `https://www.google.com/search?q=site:geeksforgeeks.org+${searchQuery}`;
//     window.open(searchURL, "_blank");
//   };
  

//   const handleNotesClick = (child, sectionIndex, stepIndex) => {
//     navigate("/notes", {
//       state: {
//         topic: child.name,
//         courseId: id,
//         sectionIndex,
//         stepIndex,
//         returnPath: `/courses/${id}`,
//       },
//     });
//   };

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p className="error">{error}</p>;
//   if (!course) return <p>No course found.</p>;

//   let stepNumber = 1;

//   return (
//     <div className="course-container">
//       <h2>{course.technology} Learning Pathway</h2>
//       <ProgressBar now={progress} className="h-5" />
      
//       <table className="pathway-table">
//         <thead>
//           <tr>
//             <th>Sr.No.</th>
//             <th>Description</th>
//             <th>Status</th>
//             <th>Resources</th>
//             <th>Notes</th>
//             <th>Quiz</th>
//           </tr>
//         </thead>
//         <tbody>
//           {course.pathway.map((section, sectionIndex) =>
//             section.children.map((child, stepIndex) => {
//               const stepId = `${sectionIndex}-${stepIndex}`;
//               const isCompleted = completedSteps.has(stepId);
              
//               return (
//                 <tr key={stepId}>
//                   <td>{stepNumber++}</td>
//                   <td>{child.name}</td>
//                   <td>
//                     <input
//                       type="checkbox"
//                       id={`step-${stepId}`}
//                       checked={isCompleted}
//                       onChange={() => handleStepClick(sectionIndex, stepIndex)}
//                     />
//                     <label htmlFor={`step-${stepId}`}></label>
//                   </td>
//                   <td>
//                     <button 
//                       onClick={() => handleResourcesClick(child.name)}
//                       className="resource-btn"
//                     >
//                       Resources
//                     </button>
//                   </td>
//                   <td>
//                     <button 
//                       onClick={() => handleNotesClick(child, sectionIndex, stepIndex)}
//                       className="notes-btn"
//                     >
//                       Notes
//                     </button>
//                   </td>
//                   <td>
//                     <button 
//                       onClick={() => handleQuizClick(child, sectionIndex, stepIndex)}
//                       className="quiz-btn"
//                     >
//                       Quiz
//                     </button>
//                   </td>
//                 </tr>
//               );
//             })
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default CoursePathway;


import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Checkbox,
  Button,
  Stack,
  Card,
  CardContent,
  CardActions,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import QuizIcon from "@mui/icons-material/Quiz";
import NotesIcon from "@mui/icons-material/Notes";
import LinkIcon from "@mui/icons-material/Link";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const thStyle = {
  background: "#1976d2",
  color: "#fff",
  padding: "12px 6px",
  fontWeight: 700,
  fontSize: 16,
};

const tdStyle = {
  padding: "10px 5px",
  borderBottom: "1px solid #eee",
  textAlign: "left",
  fontSize: 15,
};

const CoursePathway = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      setError("");
      setCourse(null);
      setProgress(0);
      setCompletedSteps(new Set());

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You are not authenticated. Please log in.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/courses/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        let fetchedCourse = response.data;
        if (Array.isArray(fetchedCourse) && fetchedCourse.length > 0) {
          fetchedCourse = fetchedCourse[0];
        }

        setCourse(fetchedCourse);
        setProgress(Number(fetchedCourse.progress) || 0);

        if (fetchedCourse.pathway) {
          const steps = getPathwaySteps(fetchedCourse.pathway);
          const totalSteps = steps.length || 1;
          const completedCount = Math.round(
            ((Number(fetchedCourse.progress) || 0) / 100) * totalSteps
          );

          const newCompletedSteps = new Set();
          steps.slice(0, completedCount).forEach((step) => {
            newCompletedSteps.add(step.id);
          });

          setCompletedSteps(newCompletedSteps);
        }
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch course.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const getPathwaySteps = (pathway) => {
    if (!pathway) return [];
    const rawSections = Array.isArray(pathway) ? pathway : (pathway.children || []);
    const steps = [];
    rawSections.forEach((section, sIdx) => {
      if (section.children && section.children.length > 0) {
        section.children.forEach((child, cIdx) => {
          steps.push({
            id: `${sIdx}-${cIdx}`,
            name: child.name || `Topic ${cIdx + 1}`,
            sectionIndex: sIdx,
            stepIndex: cIdx,
            quiz: child.quiz || []
          });
        });
      } else if (section.name) {
        steps.push({
          id: `${sIdx}-0`,
          name: section.name,
          sectionIndex: sIdx,
          stepIndex: 0,
          quiz: section.quiz || []
        });
      }
    });
    return steps;
  };

  const handleStepClick = async (stepId) => {
    if (!course) return;

    try {
      const newCompletedSteps = new Set(completedSteps);

      if (newCompletedSteps.has(stepId)) {
        newCompletedSteps.delete(stepId);
      } else {
        newCompletedSteps.add(stepId);
      }

      const steps = getPathwaySteps(course.pathway);
      const totalSteps = steps.length || 1;
      const newProgress = Math.round(
        (newCompletedSteps.size / totalSteps) * 100
      );

      setCompletedSteps(newCompletedSteps);
      setProgress(newProgress);

      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/courses/${id}/progress`,
        {
          progress: newProgress,
          completedSteps: Array.from(newCompletedSteps),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Progress update failed:", error);
      setError("Failed to save progress. Please try again.");
    }
  };

  const handleQuizClick = (topicName, quizData, sectionIndex, stepIndex) => {
    navigate("/quiz", {
      state: {
        topic: topicName,
        quizData: quizData || [],
        courseId: id,
        sectionIndex,
        stepIndex,
      },
    });
  };

  const handleResourcesClick = (topic) => {
    const searchQuery = encodeURIComponent(topic.trim());
    const searchURL = `https://www.google.com/search?q=site:geeksforgeeks.org+${searchQuery}`;
    window.open(searchURL, "_blank");
  };

  const handleNotesClick = (topicName, sectionIndex, stepIndex) => {
    navigate("/notes", {
      state: {
        topic: topicName,
        courseId: id,
        sectionIndex,
        stepIndex,
        returnPath: `/courses/${id}`,
      },
    });
  };

  // Loading/Error State
  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="30vh">
        <Typography variant="h6" color="textSecondary">
          Loading...
        </Typography>
      </Box>
    );
  if (error)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="30vh">
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  if (!course)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="30vh">
        <Typography variant="h6" color="textSecondary">
          No course found.
        </Typography>
      </Box>
    );

  const steps = getPathwaySteps(course.pathway);

  // ------------ Mobile Card Layout ------------
  if (isMobile) {
    return (
      <Box maxWidth={400} mx="auto" px={1} py={2}>
        <Typography variant="h5" mb={1} align="center" fontWeight={700}>
          {course.technology} Learning Pathway
        </Typography>
        <Box mb={2}>
          <LinearProgress
            value={progress}
            variant="determinate"
            sx={{ height: 10, borderRadius: 5 }}
          />
          <Typography align="center" fontWeight={500} mt={1}>
            {progress}% Complete
          </Typography>
        </Box>
        <Stack spacing={2}>
          {steps.map((step, idx) => {
            const isCompleted = completedSteps.has(step.id);
            return (
              <Card key={step.id} elevation={3} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" mb={1}>
                    Step {idx + 1}
                  </Typography>
                  <Typography variant="body1" mb={1} fontWeight={600}>
                    {step.name}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "space-between", px: 2 }}>
                  <Box>
                    <Checkbox
                      checked={isCompleted}
                      icon={<CheckCircleIcon color="disabled" />}
                      checkedIcon={<CheckCircleIcon color="primary" />}
                      onChange={() => handleStepClick(step.id)}
                      sx={{ p: 0 }}
                    />
                    <Typography variant="caption" component="span" ml={0.5}>
                      Done
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      startIcon={<LinkIcon />}
                      color="info"
                      onClick={() => handleResourcesClick(step.name)}
                    >
                      Resources
                    </Button>
                    <Button
                      size="small"
                      startIcon={<NotesIcon />}
                      color="success"
                      onClick={() => handleNotesClick(step.name, step.sectionIndex, step.stepIndex)}
                    >
                      Notes
                    </Button>
                    <Button
                      size="small"
                      startIcon={<QuizIcon />}
                      color="warning"
                      onClick={() => handleQuizClick(step.name, step.quiz, step.sectionIndex, step.stepIndex)}
                    >
                      Quiz
                    </Button>
                  </Stack>
                </CardActions>
              </Card>
            );
          })}
        </Stack>
      </Box>
    );
  }

  // ------------ Desktop/Tablet Table Layout ------------
  return (
    <Box maxWidth={900} mx="auto" px={2} py={3}>
      <Typography variant="h4" mb={1} align="center" fontWeight={700}>
        {course.technology} Learning Pathway
      </Typography>
      <Box mb={2}>
        <LinearProgress
          value={progress}
          variant="determinate"
          sx={{ height: 14, borderRadius: 5 }}
        />
        <Typography align="center" fontWeight={600} mt={1}>
          {progress}% Complete
        </Typography>
      </Box>
      <Paper sx={{ overflowX: "auto", borderRadius: 3 }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 600,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Sr.No.</th>
              <th style={thStyle}>Description</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Resources</th>
              <th style={thStyle}>Notes</th>
              <th style={thStyle}>Quiz</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step, idx) => {
              const isCompleted = completedSteps.has(step.id);

              return (
                <tr key={step.id}>
                  <td style={tdStyle}>{idx + 1}</td>
                  <td style={tdStyle}>{step.name}</td>
                  <td style={tdStyle}>
                    <Checkbox
                      checked={isCompleted}
                      icon={<CheckCircleIcon color="disabled" />}
                      checkedIcon={<CheckCircleIcon color="primary" />}
                      onChange={() => handleStepClick(step.id)}
                      sx={{ p: 0 }}
                    />
                  </td>
                  <td style={tdStyle}>
                    <Button
                      size="small"
                      startIcon={<LinkIcon />}
                      color="info"
                      variant="outlined"
                      onClick={() => handleResourcesClick(step.name)}
                    >
                      Resources
                    </Button>
                  </td>
                  <td style={tdStyle}>
                    <Button
                      size="small"
                      startIcon={<NotesIcon />}
                      color="success"
                      variant="outlined"
                      onClick={() => handleNotesClick(step.name, step.sectionIndex, step.stepIndex)}
                    >
                      Notes
                    </Button>
                  </td>
                  <td style={tdStyle}>
                    <Button
                      size="small"
                      startIcon={<QuizIcon />}
                      color="warning"
                      variant="outlined"
                      onClick={() => handleQuizClick(step.name, step.quiz, step.sectionIndex, step.stepIndex)}
                    >
                      Quiz
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Paper>
    </Box>
  );
};

export default CoursePathway;
