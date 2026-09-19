import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        // Check if token exists
        if (!token) {
          setMessage("Please login first");
          setLoading(false);
          navigate("/login");
          return;
        }

        const response = await API.get("/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Profile Response:", response.data);

        setUser(response.data.user);
      } catch (error) {
        console.log(
          "Profile Error:",
          error.response?.data || error
        );

        setMessage(
          error.response?.data?.message ||
            "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [navigate]);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loading-orb"></div>

        <h2>LOADING PROFILE</h2>

        <p>AI system is retrieving your profile...</p>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (message) {
    return (
      <div className="profile-loading">
        <div className="error-icon">!</div>

        <h2>{message}</h2>

        <button
          className="profile-button"
          onClick={() => navigate("/login")}
        >
          GO TO LOGIN
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-loading">
        <div className="error-icon">?</div>

        <h2>User not found</h2>

        <button
          className="profile-button"
          onClick={() => navigate("/dashboard")}
        >
          BACK TO DASHBOARD
        </button>
      </div>
    );
  }

  // =========================
  // PROFILE
  // =========================

  return (
    <div className="profile-page">

      {/* Background */}
      <div className="profile-grid"></div>

      <div className="profile-glow profile-glow-blue"></div>
      <div className="profile-glow profile-glow-purple"></div>


      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="profile-nav">

        <div
          className="profile-logo"
          onClick={() => navigate("/dashboard")}
        >
          <span className="profile-logo-symbol">◈</span>

          <div>
            <strong>AI INTERVIEW</strong>
            <small>INTELLIGENCE PLATFORM</small>
          </div>
        </div>


        <div className="profile-nav-center">
          <span className="online-dot"></span>
          SYSTEM ONLINE
        </div>


        <button
          className="back-nav"
          onClick={() => navigate("/dashboard")}
        >
          ← DASHBOARD
        </button>

      </nav>


      {/* =========================
          MAIN
      ========================= */}

      <main className="profile-main">

        {/* Header */}

        <section className="profile-header">

          <div>

            <div className="profile-eyebrow">
              <span></span>
              USER IDENTITY
            </div>

            <h1>
              Your
              <span> Profile</span>
            </h1>

            <p>
              Manage your interview identity, skills and
              career preferences.
            </p>

          </div>


          {/* AI Orb */}

          <div className="profile-orb">

            <div className="profile-orb-center">
              AI
            </div>

            <div className="profile-orb-ring ring-one"></div>
            <div className="profile-orb-ring ring-two"></div>
            <div className="profile-orb-ring ring-three"></div>

          </div>

        </section>


        {/* =========================
            PROFILE CARD
        ========================= */}

        <section className="profile-card">

          {/* Card top */}

          <div className="profile-card-top">

            <div className="profile-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>

            <div className="profile-status">
              <span></span>
              PROFILE ACTIVE
            </div>

          </div>


          {/* Name */}

          <div className="profile-name-section">

            <div className="profile-label">
              FULL NAME
            </div>

            <h2>{user.name}</h2>

          </div>


          {/* Data */}

          <div className="profile-info-grid">

            {/* Email */}

            <div className="profile-info-box">

              <div className="info-icon">
                @
              </div>

              <div>
                <span>EMAIL ADDRESS</span>

                <strong>
                  {user.email}
                </strong>
              </div>

            </div>


            {/* Target Role */}

            <div className="profile-info-box">

              <div className="info-icon">
                ◉
              </div>

              <div>
                <span>TARGET ROLE</span>

                <strong>
                  {user.targetRole || "Not selected"}
                </strong>
              </div>

            </div>


            {/* Skills */}

            <div className="profile-info-box profile-skills-box">

              <div className="info-icon">
                ◆
              </div>

              <div>

                <span>TECHNICAL SKILLS</span>

                <div className="skills-container">

                  {user.skills && user.skills.length > 0 ? (
                    user.skills.map((skill, index) => (
                      <span
                        className="skill-tag"
                        key={index}
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <strong>No skills added</strong>
                  )}

                </div>

              </div>

            </div>

          </div>


          {/* Divider */}

          <div className="profile-divider"></div>


          {/* Actions */}

          <div className="profile-actions">

            <button
              className="edit-profile-button"
              onClick={() => navigate("/edit-profile")}
            >
              <span>✎</span>

              <div>
                <strong>EDIT PROFILE</strong>
                <small>
                  Update your information
                </small>
              </div>

              <b>→</b>
            </button>


            <button
              className="dashboard-button"
              onClick={() => navigate("/dashboard")}
            >
              ← BACK TO DASHBOARD
            </button>

          </div>

        </section>


        {/* =========================
            FOOTER STATUS
        ========================= */}

        <div className="profile-footer">

          <span>
            ● PROFILE DATA SECURED
          </span>

          <span>
            AI INTERVIEW SYSTEM / 2026
          </span>

        </div>

      </main>

    </div>
  );
}

export default Profile;