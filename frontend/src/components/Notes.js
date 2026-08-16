import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Button, Card, Alert } from "react-bootstrap";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./Notes.css";

const GOOGLE_GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GOOGLE_GEMINI_API_URL = process.env.REACT_APP_GEMINI_API_URL || "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";

const Notes = () => {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { topic, returnPath } = location.state || {};
  const notesRef = useRef(null);

  useEffect(() => {
    if (!topic) {
      setError("No topic provided");
      setLoading(false);
      return;
    }

    const generateNotes = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${GOOGLE_GEMINI_API_URL}?key=${GOOGLE_GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Generate comprehensive study notes about ${topic} for a computer science student. 
                      Include key concepts, definitions, examples, and code snippets where applicable. 
                      Format the response in Markdown with proper headings, bullet points, and code blocks.
                      Structure should include:
                      - Introduction
                      - Key Concepts
                      - Examples
                      - Best Practices
                      - Common Pitfalls
                      - Summary`
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const generatedNotes = data.candidates?.[0]?.content?.parts?.[0]?.text || "No notes were generated.";

        const cleanedNotes = generatedNotes.replace(/```markdown/g, '').replace(/```/g, '').trim();
        setNotes(cleanedNotes);
      } catch (error) {
        console.error("Error generating notes:", error);
        setError(`Failed to generate notes: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    generateNotes();
  }, [topic]);

  const handleBack = () => {
    navigate(returnPath || "/");
  };


  const downloadAsPDF = async () => {
  const input = notesRef.current;
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;

  const canvas = await html2canvas(input, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  const imgProps = pdf.getImageProperties(imgData);
  const imgWidth = pageWidth - margin * 2;
  const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

  const totalPDFPages = Math.ceil(imgHeight / (pageHeight - margin * 2));

  let yOffset = 0;

  for (let i = 0; i < totalPDFPages; i++) {
    const position = -i * (pageHeight - margin * 2);
    pdf.addImage(
      imgData,
      "PNG",
      margin,
      position + margin,
      imgWidth,
      imgHeight
    );
    if (i < totalPDFPages - 1) {
      pdf.addPage();
    }
  }

  pdf.save(`${topic}_notes.pdf`);
};


  if (loading) {
    return (
      <div className="notes-container">
        <Card className="notes-loading-card">
          <div className="notes-spinner"></div>
          <h4>Generating notes about: {topic}</h4>
          <p>This may take a moment...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notes-container">
        <Card className="notes-error-card">
          <h3>Error Generating Notes</h3>
          <Alert variant="danger">{error}</Alert>
          <Button
            variant="primary"
            onClick={() => window.location.reload()}
            className="notes-retry-button"
          >
            Try Again
          </Button>
          <Button
            variant="secondary"
            onClick={handleBack}
            className="notes-back-button"
          >
            Back to Course
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="notes-container">
      <Card className="notes-content-card">
        <div className="notes-header">
          <h2>Notes: {topic}</h2>
          <div>
            <Button
              variant="success"
              onClick={downloadAsPDF}
              className="notes-download-button"
            >
              Download PDF
            </Button>
            <Button
              variant="outline-secondary"
              onClick={handleBack}
              className="notes-back-button"
            >
              Back to Course
            </Button>
          </div>
        </div>

        <Card.Body className="notes-markdown-content" ref={notesRef}>
          <ReactMarkdown>{notes}</ReactMarkdown>
        </Card.Body>

        <div className="notes-footer">
          <Button
            variant="success"
            onClick={downloadAsPDF}
            className="notes-download-button"
          >
            Download PDF
          </Button>
          <Button
            variant="primary"
            onClick={handleBack}
            className="notes-back-button"
          >
            Back to Course
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Notes;










