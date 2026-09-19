import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [difficulty, setDifficulty] = useState("Easy");
  const [interviewType, setInterviewType] = useState("HR");
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);

  const [loading, setLoading] = useState(true);
  const [startingInterview, setStartingInterview] = useState(false);

  // Get logged-in user's profile
  useEffect(() => {
    const getProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await API.get("/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Profile:", response.data);

        setUser(response.data.user);
      } catch (error) {
        console.log(
          "Dashboard Error:",
          error.response?.data || error.message
        );

        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [navigate]);

  // Start interview
  const handleStartInterview = async () => {
    try {
      setStartingInterview(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await API.post(
        "/interview/start",
        {
          interviewType,
          difficulty,
          numberOfQuestions,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Interview created:", response.data);

      navigate(
        `/interview/${response.data.interview._id}`
      );
    } catch (error) {
      console.log(
        "Interview Error:",
        error.response?.data || error.message
      );

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      alert(
        error.response?.data?.message ||
          "Failed to start interview"
      );
    } finally {
      setStartingInterview(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Loading
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-orb"></div>
        <h2>INITIALIZING AI CORE</h2>
        <p>Loading your interview environment...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-page">

      {/* Background */}
      <div className="dashboard-grid"></div>

      <div className="dashboard-glow glow-blue"></div>
      <div className="dashboard-glow glow-purple"></div>

      {/* Navbar */}
      <nav className="dashboard-nav">

        <div
          className="dashboard-logo"
          onClick={() => navigate("/dashboard")}
        >
          <span className="logo-symbol">◈</span>

          <div>
            <strong>AI INTERVIEW</strong>
            <small>INTELLIGENCE PLATFORM</small>
          </div>
        </div>

        <div className="nav-status">
          <span className="online-dot"></span>
          AI SYSTEM ONLINE
        </div>

        <button
          className="logout-nav"
          onClick={handleLogout}
        >
          LOGOUT
        </button>

      </nav>

      {/* Main */}
      <main className="dashboard-main">

        {/* Header */}
        <section className="dashboard-header">

          <div>
            <div className="eyebrow">
              <span></span>
              PERSONAL COMMAND CENTER
            </div>

            <h1>
              Welcome back,
              <span> {user.name}</span>
            </h1>

            <p>
              Your AI-powered interview preparation
              environment is ready.
            </p>
          </div>

          {/* AI Orb */}
          <div className="dashboard-orb">
            <div className="orb-center">AI</div>
            <div className="orb-circle circle-one"></div>
            <div className="orb-circle circle-two"></div>
            <div className="orb-circle circle-three"></div>
          </div>

        </section>

        {/* Quick Cards */}
        <section className="quick-cards">

          <div className="quick-card">
            <div className="quick-icon">◉</div>
            <div>
              <span>ACCOUNT</span>
              <strong>ACTIVE</strong>
            </div>
          </div>

          <div className="quick-card">
            <div className="quick-icon">✦</div>
            <div>
              <span>AI ENGINE</span>
              <strong>READY</strong>
            </div>
          </div>

          <div className="quick-card">
            <div className="quick-icon">⚡</div>
            <div>
              <span>INTERVIEW MODE</span>
              <strong>{interviewType}</strong>
            </div>
          </div>

          <div className="quick-card">
            <div className="quick-icon">◆</div>
            <div>
              <span>DIFFICULTY</span>
              <strong>{difficulty}</strong>
            </div>
          </div>

        </section>

        {/* Content Grid */}
        <section className="dashboard-content">

          {/* Start Interview */}
          <div className="interview-panel">

            <div className="panel-header">
              <div>
                <span className="panel-number">
                  01
                </span>

                <div>
                  <h2>Launch Interview</h2>
                  <p>
                    Configure your AI interview session
                  </p>
                </div>
              </div>

              <span className="panel-live">
                ● LIVE
              </span>
            </div>

            <div className="configuration">

              {/* Interview Type */}
              <div className="config-item">
                <label>
                  INTERVIEW TYPE
                </label>

                <select
                  value={interviewType}
                  onChange={(e) =>
                    setInterviewType(e.target.value)
                  }
                >
                  <option value="Technical">
                    Technical Interview
                  </option>

                  <option value="HR">
                    HR Interview
                  </option>

                  <option value="Mixed">
                    Mixed Interview
                  </option>
                </select>
              </div>

              {/* Difficulty */}
              <div className="config-item">
                <label>
                  DIFFICULTY LEVEL
                </label>

                <select
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(e.target.value)
                  }
                >
                  <option value="Easy">
                    Easy
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="Hard">
                    Hard
                  </option>
                </select>
              </div>

              {/* Questions */}
              <div className="config-item">
                <label>
                  NUMBER OF QUESTIONS
                </label>

                <select
                  value={numberOfQuestions}
                  onChange={(e) =>
                    setNumberOfQuestions(
                      Number(e.target.value)
                    )
                  }
                >
                  <option value={5}>
                    5 Questions
                  </option>

                  <option value={10}>
                    10 Questions
                  </option>

                  <option value={15}>
                    15 Questions
                  </option>
                </select>
              </div>

            </div>

            {/* Start */}
            <button
              className="launch-button"
              onClick={handleStartInterview}
              disabled={startingInterview}
            >
              <div className="launch-icon">
                {startingInterview ? "◌" : "▶"}
              </div>

              <div>
                <strong>
                  {startingInterview
                    ? "INITIALIZING INTERVIEW..."
                    : "START AI INTERVIEW"}
                </strong>

                <span>
                  {startingInterview
                    ? "Connecting to AI engine"
                    : "Begin your personalized session"}
                </span>
              </div>

              {!startingInterview && (
                <b>→</b>
              )}
            </button>

          </div>

          {/* Profile */}
          <div className="profile-panel">

            <div className="profile-top">
              <span className="panel-number">
                02
              </span>

              <span>PROFILE</span>
            </div>

            <div className="profile-avatar">
              {user.name?.charAt(0)?.toUpperCase()}
            </div>

            <h2>{user.name}</h2>

            <p>{user.email}</p>

            <div className="profile-data">

              <div>
                <span>TARGET ROLE</span>
                <strong>
                  {user.targetRole || "Not selected"}
                </strong>
              </div>

              <div>
                <span>SKILLS</span>
                <strong>
                  {user.skills?.length > 0
                    ? user.skills.join(", ")
                    : "No skills added"}
                </strong>
              </div>

            </div>

            <button
              className="outline-button"
              onClick={() => navigate("/profile")}
            >
              VIEW FULL PROFILE →
            </button>

          </div>

        </section>

        {/* Bottom Tools */}
        <section className="tools-section">

          <div className="tool-title">
            <span>03</span>
            <div>
              <h2>Intelligence Tools</h2>
              <p>
                Analyze and improve your interview performance
              </p>
            </div>
          </div>

          <div className="tool-cards">

            <button
              className="tool-card"
              onClick={() => navigate("/analytics")}
            >
              <span className="tool-icon">◒</span>

              <div>
                <strong>Analytics</strong>
                <small>
                  Performance intelligence
                </small>
              </div>

              <b>→</b>
            </button>

            <button
              className="tool-card"
              onClick={() =>
                navigate("/career-insights")
              }
            >
              <span className="tool-icon">✦</span>

              <div>
                <strong>AI Career Insights</strong>
                <small>
                  Personalized career guidance
                </small>
              </div>

              <b>→</b>
            </button>

            <button
              className="tool-card"
              onClick={() => navigate("/profile")}
            >
              <span className="tool-icon">◎</span>

              <div>
                <strong>My Profile</strong>
                <small>
                  Manage your information
                </small>
              </div>

              <b>→</b>
            </button>

          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <span>AI INTERVIEW SYSTEM v2.0</span>

        <div>
          <span className="online-dot"></span>
          SECURE CONNECTION
        </div>
      </footer>

    </div>
  );
}

export default Dashboard;