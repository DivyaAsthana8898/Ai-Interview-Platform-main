import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import "./Result.css";

function Result() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getInterviewResult = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await API.get(`/interview/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Result:", response.data);

        setInterview(response.data.interview);
      } catch (error) {
        console.log(
          "Result Error:",
          error.response?.data || error.message
        );

        setError(
          error.response?.data?.message ||
            "Failed to load interview result"
        );
      } finally {
        setLoading(false);
      }
    };

    getInterviewResult();
  }, [id]);

  if (loading) {
    return (
      <div className="result-loading">
        <div className="loader"></div>
        <h2>Analyzing your interview...</h2>
        <p>Please wait while we prepare your results.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="result-error">
        <h2>Something went wrong</h2>
        <p>{error}</p>

        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="result-error">
        <h2>Interview not found</h2>

        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const questions = interview.questions || [];

  const answeredQuestions = questions.filter(
    (q) => q.answer && q.answer.trim() !== ""
  );

  const totalScore = answeredQuestions.reduce(
    (sum, q) => sum + (Number(q.score) || 0),
    0
  );

  const averageScore =
    answeredQuestions.length > 0
      ? totalScore / answeredQuestions.length
      : 0;

  const percentage = averageScore * 10;

  let performance = "";
  let performanceClass = "";

  if (averageScore >= 8) {
    performance = "Excellent";
    performanceClass = "excellent";
  } else if (averageScore >= 6) {
    performance = "Good";
    performanceClass = "good";
  } else if (averageScore >= 4) {
    performance = "Average";
    performanceClass = "average";
  } else {
    performance = "Needs Improvement";
    performanceClass = "needs-improvement";
  }

  // Collect all strengths
  const strengths = questions.flatMap(
    (q) => q.strengths || []
  );

  // Collect all improvements
  const improvements = questions.flatMap(
    (q) => q.improvements || []
  );

  // Remove duplicates
  const uniqueStrengths = [...new Set(strengths)];
  const uniqueImprovements = [...new Set(improvements)];

  return (
    <div className="result-page">

      {/* Header */}
      <header className="result-header">
        <div>
          <p className="result-label">AI INTERVIEW PLATFORM</p>

          <h1>Interview Results</h1>

          <p className="result-subtitle">
            Here's your detailed AI-powered performance analysis.
          </p>
        </div>

        <button
          className="dashboard-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
      </header>

      {/* Score Section */}
      <section className="score-section">

        <div className="score-card">

          <div className="score-circle">
            <div>
              <span className="score-number">
                {averageScore.toFixed(1)}
              </span>

              <span className="score-total">
                /10
              </span>
            </div>
          </div>

          <div className="score-content">

            <p className="small-title">
              OVERALL PERFORMANCE
            </p>

            <h2 className={performanceClass}>
              {performance}
            </h2>

            <p>
              You answered{" "}
              <strong>{answeredQuestions.length}</strong>{" "}
              out of{" "}
              <strong>{questions.length}</strong>{" "}
              questions.
            </p>

            <div className="progress-container">
              <div className="progress-label">
                <span>Performance</span>
                <span>{percentage.toFixed(0)}%</span>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${percentage}%`,
                  }}
                ></div>
              </div>
            </div>

          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">

          <div className="stat-card">
            <span className="stat-icon">📝</span>

            <div>
              <p>Total Questions</p>
              <h3>{questions.length}</h3>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">✅</span>

            <div>
              <p>Answered</p>
              <h3>{answeredQuestions.length}</h3>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">⭐</span>

            <div>
              <p>Average Score</p>
              <h3>{averageScore.toFixed(1)}/10</h3>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">🎯</span>

            <div>
              <p>Interview Type</p>
              <h3>{interview.interviewType}</h3>
            </div>
          </div>

        </div>
      </section>

      {/* Interview Details */}
      <section className="details-card">

        <div>
          <span>Interview Type</span>
          <strong>{interview.interviewType}</strong>
        </div>

        <div>
          <span>Difficulty</span>
          <strong>{interview.difficulty}</strong>
        </div>

        <div>
          <span>Questions</span>
          <strong>{interview.numberOfQuestions}</strong>
        </div>

        <div>
          <span>Status</span>
          <strong className="completed">
            ● Completed
          </strong>
        </div>

      </section>

      {/* AI Summary */}
      <section className="analysis-grid">

        {/* Strengths */}
        <div className="analysis-card strengths-card">

          <div className="analysis-heading">
            <div className="analysis-icon strength-icon">
              ✓
            </div>

            <div>
              <h2>Your Strengths</h2>
              <p>What you did well</p>
            </div>
          </div>

          {uniqueStrengths.length > 0 ? (
            <ul>
              {uniqueStrengths.slice(0, 6).map(
                (strength, index) => (
                  <li key={index}>
                    <span>✓</span>
                    {strength}
                  </li>
                )
              )}
            </ul>
          ) : (
            <p className="empty-text">
              No strengths available yet.
            </p>
          )}

        </div>

        {/* Improvements */}
        <div className="analysis-card improvements-card">

          <div className="analysis-heading">
            <div className="analysis-icon improvement-icon">
              !
            </div>

            <div>
              <h2>Areas to Improve</h2>
              <p>How you can perform better</p>
            </div>
          </div>

          {uniqueImprovements.length > 0 ? (
            <ul>
              {uniqueImprovements.slice(0, 6).map(
                (improvement, index) => (
                  <li key={index}>
                    <span>!</span>
                    {improvement}
                  </li>
                )
              )}
            </ul>
          ) : (
            <p className="empty-text">
              No improvement suggestions available.
            </p>
          )}

        </div>

      </section>

      {/* Question Review */}
      <section className="review-section">

        <div className="section-heading">
          <div>
            <p className="result-label">
              DETAILED ANALYSIS
            </p>

            <h2>Question Review</h2>

            <p>
              Review your answers and AI-generated feedback.
            </p>
          </div>
        </div>

        <div className="question-list">

          {questions.map((question, index) => {

            const score = Number(question.score) || 0;

            return (
              <div
                className="question-card"
                key={question._id || index}
              >

                <div className="question-top">

                  <div className="question-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="question-title">
                    <span>QUESTION {index + 1}</span>

                    <h3>
                      {question.question}
                    </h3>
                  </div>

                  <div
                    className={`question-score ${
                      score >= 8
                        ? "score-excellent"
                        : score >= 6
                        ? "score-good"
                        : score >= 4
                        ? "score-average"
                        : "score-low"
                    }`}
                  >
                    {score}/10
                  </div>

                </div>

                {/* Answer */}
                <div className="answer-box">

                  <h4>Your Answer</h4>

                  <p>
                    {question.answer ||
                      "No answer provided."}
                  </p>

                </div>

                {/* Feedback */}
                <div className="feedback-box">

                  <h4>🤖 AI Feedback</h4>

                  <p>
                    {question.feedback ||
                      "No feedback available."}
                  </p>

                </div>

                {/* Strengths & Improvements */}
                <div className="question-analysis">

                  <div>
                    <h4>✓ Strengths</h4>

                    {question.strengths?.length > 0 ? (
                      <ul>
                        {question.strengths.map(
                          (item, i) => (
                            <li key={i}>{item}</li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p>No specific strengths.</p>
                    )}
                  </div>

                  <div>
                    <h4>! Improvements</h4>

                    {question.improvements?.length > 0 ? (
                      <ul>
                        {question.improvements.map(
                          (item, i) => (
                            <li key={i}>{item}</li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p>No specific improvements.</p>
                    )}
                  </div>

                </div>

              </div>
            );
          })}

        </div>
      </section>

      {/* Bottom Actions */}
      <section className="result-actions">

        <div>
          <h2>Ready for another challenge?</h2>

          <p>
            Practice again to improve your interview
            performance.
          </p>
        </div>

        <div className="action-buttons">

          <button
            className="secondary-btn"
            onClick={() => navigate("/dashboard")}
          >
            🏠 Dashboard
          </button>

          <button
            className="primary-btn"
            onClick={() => navigate("/dashboard")}
          >
            🔄 Take Another Interview
          </button>

        </div>

      </section>

    </div>
  );
}

export default Result;