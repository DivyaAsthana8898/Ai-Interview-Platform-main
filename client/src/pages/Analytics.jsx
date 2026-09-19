import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Analytics.css";

function Analytics() {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await API.get(
          "/interview/history",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setInterviews(
          response.data.interviews || []
        );
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
            "Failed to load interview analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  const completedInterviews = useMemo(() => {
    return interviews.filter(
      (interview) =>
        interview.status === "completed"
    );
  }, [interviews]);

  const getInterviewAverage = (interview) => {
    const questions = interview.questions || [];

    if (questions.length === 0) {
      return 0;
    }

    const total = questions.reduce(
      (sum, question) =>
        sum + (Number(question.score) || 0),
      0
    );

    return total / questions.length;
  };

  const analytics = useMemo(() => {
    if (completedInterviews.length === 0) {
      return {
        average: 0,
        best: 0,
        total: 0,
      };
    }

    const scores = completedInterviews.map(
      getInterviewAverage
    );

    const total = scores.reduce(
      (sum, score) => sum + score,
      0
    );

    return {
      average: total / scores.length,
      best: Math.max(...scores),
      total: completedInterviews.length,
    };
  }, [completedInterviews]);

  const typePerformance = useMemo(() => {
    const types = {
      Technical: [],
      HR: [],
      Mixed: [],
    };

    completedInterviews.forEach((interview) => {
      const type = interview.interviewType;

      if (types[type]) {
        types[type].push(
          getInterviewAverage(interview)
        );
      }
    });

    const result = {};

    Object.keys(types).forEach((type) => {
      const scores = types[type];

      result[type] =
        scores.length > 0
          ? scores.reduce(
              (sum, score) => sum + score,
              0
            ) / scores.length
          : 0;
    });

    return result;
  }, [completedInterviews]);

  const getPerformanceLabel = (score) => {
    if (score >= 8) return "Excellent";
    if (score >= 6) return "Good";
    if (score >= 4) return "Average";
    return "Needs Improvement";
  };

  const getPerformanceClass = (score) => {
    if (score >= 8) return "excellent";
    if (score >= 6) return "good";
    if (score >= 4) return "average";
    return "needs-improvement";
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          <div className="analytics-spinner"></div>
          <h2>Loading Analytics...</h2>
          <p>
            Analyzing your interview performance.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-error">
          <h2>⚠️ Unable to Load Analytics</h2>
          <p>{error}</p>

          <button
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">

      {/* Header */}

      <div className="analytics-header">

        <div>
          <p className="analytics-eyebrow">
            PERFORMANCE CENTER
          </p>

          <h1>📊 Interview Analytics</h1>

          <p>
            Track your interview performance and
            identify areas for improvement.
          </p>
        </div>

        <button
          className="analytics-back-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

      </div>


      {/* Stats */}

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">🎤</div>

          <div>
            <p>Total Interviews</p>
            <h2>{analytics.total}</h2>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon">📈</div>

          <div>
            <p>Average Score</p>

            <h2>
              {analytics.average.toFixed(1)}
              <span>/10</span>
            </h2>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon">🏆</div>

          <div>
            <p>Best Score</p>

            <h2>
              {analytics.best.toFixed(1)}
              <span>/10</span>
            </h2>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon">🎯</div>

          <div>
            <p>Performance</p>

            <h2
              className={
                getPerformanceClass(
                  analytics.average
                )
              }
            >
              {getPerformanceLabel(
                analytics.average
              )}
            </h2>
          </div>
        </div>

      </div>


      {/* Overall Performance */}

      <div className="analytics-card">

        <div className="card-heading">
          <div>
            <h2>📈 Overall Performance</h2>
            <p>
              Your average score across completed
              interviews.
            </p>
          </div>

          <strong>
            {analytics.average.toFixed(1)}/10
          </strong>
        </div>

        <div className="large-progress">
          <div
            className="large-progress-fill"
            style={{
              width: `${
                analytics.average * 10
              }%`,
            }}
          ></div>
        </div>

        <div className="progress-labels">
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>

      </div>


      {/* Performance By Type */}

      <div className="analytics-card">

        <div className="card-heading">
          <div>
            <h2>🎯 Performance by Interview Type</h2>
            <p>
              Compare your performance across
              different interview formats.
            </p>
          </div>
        </div>


        <div className="type-performance">

          {["Technical", "HR", "Mixed"].map(
            (type) => {
              const score =
                typePerformance[type] || 0;

              return (
                <div
                  className="type-row"
                  key={type}
                >

                  <div className="type-info">

                    <span>
                      {type === "Technical"
                        ? "💻"
                        : type === "HR"
                        ? "👥"
                        : "🔄"}
                    </span>

                    <strong>{type}</strong>

                  </div>

                  <div className="type-progress">

                    <div className="type-track">

                      <div
                        className="type-fill"
                        style={{
                          width: `${
                            score * 10
                          }%`,
                        }}
                      ></div>

                    </div>

                    <span>
                      {score > 0
                        ? score.toFixed(1)
                        : "N/A"}
                      /10
                    </span>

                  </div>

                </div>
              );
            }
          )}

        </div>

      </div>


      {/* Recent Interviews */}

      <div className="analytics-card">

        <div className="card-heading">

          <div>
            <h2>🕒 Recent Interviews</h2>

            <p>
              Review your latest interview
              performance.
            </p>
          </div>

          <button
            className="take-interview-btn"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            + New Interview
          </button>

        </div>


        {completedInterviews.length === 0 ? (

          <div className="empty-analytics">

            <div>📭</div>

            <h3>No completed interviews yet</h3>

            <p>
              Complete your first interview to
              start tracking your performance.
            </p>

            <button
              onClick={() =>
                navigate("/dashboard")
              }
            >
              🎤 Start Interview
            </button>

          </div>

        ) : (

          <div className="interview-table">

            {completedInterviews
              .slice(0, 10)
              .map((interview) => {

                const score =
                  getInterviewAverage(
                    interview
                  );

                return (
                  <div
                    className="interview-row"
                    key={interview._id}
                  >

                    <div className="interview-main">

                      <div className="interview-type-icon">
                        {interview.interviewType ===
                        "Technical"
                          ? "💻"
                          : interview.interviewType ===
                            "HR"
                          ? "👥"
                          : "🔄"}
                      </div>

                      <div>

                        <h3>
                          {interview.interviewType}{" "}
                          Interview
                        </h3>

                        <p>
                          {interview.difficulty}
                          {" • "}
                          {
                            interview.questions
                              ?.length || 0
                          }{" "}
                          Questions
                        </p>

                      </div>

                    </div>


                    <div className="interview-score">

                      <strong>
                        {score.toFixed(1)}
                        <span>/10</span>
                      </strong>

                      <small
                        className={getPerformanceClass(
                          score
                        )}
                      >
                        {getPerformanceLabel(
                          score
                        )}
                      </small>

                    </div>


                    <button
                      className="view-result-btn"
                      onClick={() =>
                        navigate(
                          `/result/${interview._id}`
                        )
                      }
                    >
                      View Result →
                    </button>

                  </div>
                );
              })}

          </div>

        )}

      </div>


      {/* Bottom Actions */}

      <div className="analytics-actions">

        <button
          onClick={() =>
            navigate("/career-insights")
          }
        >
          🧠 AI Career Insights
        </button>

        <button
          onClick={() =>
            navigate("/dashboard")
          }
        >
          🎤 Start New Interview
        </button>

      </div>

    </div>
  );
}

export default Analytics;