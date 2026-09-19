import "./Login.css";
import { useState } from "react";

import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    try {
      setLoading(true);

      const response = await API.post(
        "/auth/login",
        formData
      );

      console.log("Login:", response.data);

      localStorage.setItem(
        "token",
        response.data.token
      );

      setMessage(
        response.data.message || "Login successful!"
      );

      setTimeout(() => {
        navigate("/dashboard");
      }, 500);

    } catch (error) {
      console.log(
        "Login Error:",
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
 
    <div className="login-page">

      {/* Background Effects */}
      <div className="glow glow-1"></div>
      <div className="glow glow-2"></div>

      <div className="login-container">

        {/* LEFT SIDE */}
        <div className="login-info">

          <div className="ai-badge">
            <span className="pulse-dot"></span>
            AI MOCK INTERVIEW
          </div>

          <h1>
            Crack Your Next
            <span> Interview.</span>
          </h1>

          <p>
            Practice smarter with AI-powered mock
            interviews, real-time feedback and
            personalized insights.
          </p>

          <div className="feature-list">

            <div className="feature">
              <div className="feature-icon">🤖</div>
              <div>
                <h3>AI Powered</h3>
                <p>Intelligent interview analysis</p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">⚡</div>
              <div>
                <h3>Instant Feedback</h3>
                <p>Know exactly where to improve</p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">📊</div>
              <div>
                <h3>Track Progress</h3>
                <p>Monitor your interview performance</p>
              </div>
            </div>

          </div>

        </div>

        {/* LOGIN CARD */}
        <div className="login-card">

          <div className="card-header">

            <div className="logo-circle">
              🤖
            </div>

            <h2>Welcome Back</h2>

            <p>
              Continue your interview preparation
            </p>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="input-group">
              <label>Email Address</label>

              <div className="input-wrapper">
                <span>✉</span>

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>

              <div className="input-wrapper">
                <span>🔒</span>

                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              className="login-button"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Authenticating...
                </>
              ) : (
                <>
                  Login to Dashboard
                  <span>→</span>
                </>
              )}
            </button>

          </form>

          {message && (
            <div className="login-message">
              {message}
            </div>
          )}

          <div className="register-text">
            Don't have an account?

            <Link to="/register">
              Create Account
            </Link>
          </div>

          <div className="secure-text">
            🔐 Secure authentication powered by JWT
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;