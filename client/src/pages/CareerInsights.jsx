import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./CareerInsights.css";

function CareerInsights() {
  const navigate = useNavigate();

  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInsights = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await API.get(
          "/interview/career-insights",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setInsights(response.data.insights);
      } catch (error) {
        console.error(error);

        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        setError(
          error.response?.data?.message ||
            "Failed to generate career insights."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [navigate]);

  if (loading) {
    return (
      <div className="insights-page">
        <div className="loading-card">
          <div className="loader"></div>

          <h2>🧠 Analyzing Your Performance...</h2>

          <p>
            Groq AI is analyzing your completed interviews.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="insights-page">
        <div className="error-card">
          <h2>⚠️ Career Insights</h2>

          <p>{error}</p>

          <button onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <div className="insights-page">

      {/* Header */}

      <div className="insights-header">
        <div>
          <p className="eyebrow">
            AI CAREER COACH
          </p>

          <h1>🧠 Career Insights</h1>

          <p>
            Personalized recommendations based on
            your interview performance.
          </p>
        </div>

        <button
          className="back-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
      </div>


      {/* Career Readiness */}

      <div className="readiness-card">

        <div>
          <p className="card-label">
            CAREER READINESS
          </p>

          <h2>
            {insights.careerReadiness}
            <span>/100</span>
          </h2>

          <p>
            Your current interview readiness score.
          </p>
        </div>

        <div className="readiness-circle">
          <span>
            {insights.careerReadiness}%
          </span>
        </div>

      </div>


      {/* Overall Assessment */}

      <div className="section-card">

        <h2>📋 Overall Assessment</h2>

        <p className="assessment">
          {insights.overallAssessment}
        </p>

      </div>


      {/* Strengths / Weaknesses */}

      <div className="two-column">

        <div className="section-card">

          <h2>💪 Strongest Areas</h2>

          <div className="tag-list">

            {insights.strongestAreas?.map(
              (area, index) => (
                <div
                  className="strength-tag"
                  key={index}
                >
                  ✓ {area}
                </div>
              )
            )}

          </div>

        </div>


        <div className="section-card">

          <h2>⚠️ Areas to Improve</h2>

          <div className="tag-list">

            {insights.weakAreas?.map(
              (area, index) => (
                <div
                  className="weak-tag"
                  key={index}
                >
                  • {area}
                </div>
              )
            )}

          </div>

        </div>

      </div>


      {/* Recommended Topics */}

      <div className="section-card">

        <h2>📚 Recommended Topics</h2>

        <p className="section-description">
          Focus on these topics to improve your
          interview performance.
        </p>

        <div className="topics-grid">

          {insights.recommendedTopics?.map(
            (topic, index) => (
              <div
                className="topic-card"
                key={index}
              >
                <span>
                  {index + 1}
                </span>

                <p>{topic}</p>
              </div>
            )
          )}

        </div>

      </div>


      {/* Next Interview */}

      <div className="recommendation-card">

        <div>

          <p className="card-label">
            NEXT INTERVIEW
          </p>

          <h2>
            Recommended Difficulty:
            {" "}
            <span>
              {insights.interviewRecommendation?.difficulty}
            </span>
          </h2>

          <p>
            {insights.interviewRecommendation?.reason}
          </p>

        </div>

        <button
          onClick={() => navigate("/dashboard")}
        >
          🎤 Start Interview
        </button>

      </div>


      {/* Improvement Plan */}

      <div className="section-card">

        <h2>🚀 Improvement Plan</h2>

        <p className="section-description">
          Follow these steps to improve your
          interview readiness.
        </p>

        <div className="plan-list">

          {insights.improvementPlan?.map(
            (item, index) => (
              <div
                className="plan-item"
                key={index}
              >

                <div className="plan-number">
                  {index + 1}
                </div>

                <div className="plan-content">

                  <span
                    className={`priority ${item.priority?.toLowerCase()}`}
                  >
                    {item.priority}
                  </span>

                  <p>
                    {item.action}
                  </p>

                </div>

              </div>
            )
          )}

        </div>

      </div>


      <div className="bottom-actions">

        <button
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>

        <button
          onClick={() => navigate("/analytics")}
        >
          📊 View Analytics
        </button>

      </div>

    </div>
  );
}

export default CareerInsights;