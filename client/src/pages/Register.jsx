import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
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
        "/auth/register",
        formData
      );

      console.log("Registration:", response.data);

      setMessage(
        response.data.message || "Registration successful!"
      );

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (error) {
      console.log(
        "Register Error:",
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message ||
        "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      {/* Background Effects */}
      <div className="register-grid"></div>
      <div className="register-glow glow-one"></div>
      <div className="register-glow glow-two"></div>

      {/* AI Orb */}
      <div className="ai-orb">
        <div className="orb-core"></div>
        <div className="orb-ring ring-one"></div>
        <div className="orb-ring ring-two"></div>
      </div>

      {/* Main Content */}
      <div className="register-container">

        {/* Left Side */}
        <div className="register-info">

          <div className="brand">
            <span className="brand-icon">◈</span>
            <span>AI INTERVIEW</span>
          </div>

          <h1>
            Build Your
            <span> Interview Future.</span>
          </h1>

          <p>
            Create your account and start practicing
            with an AI-powered interview experience.
          </p>

          <div className="feature-list">

            <div className="feature">
              <span>✦</span>
              <div>
                <strong>AI Powered Interviews</strong>
                <small>Practice with intelligent AI feedback</small>
              </div>
            </div>

            <div className="feature">
              <span>◉</span>
              <div>
                <strong>Real-Time Analysis</strong>
                <small>Improve your answers instantly</small>
              </div>
            </div>

            <div className="feature">
              <span>⚡</span>
              <div>
                <strong>Track Your Progress</strong>
                <small>See how your interview skills evolve</small>
              </div>
            </div>

          </div>

        </div>

        {/* Register Card */}
        <div className="register-card">

          <div className="card-top">
            <div>
              <span className="status-dot"></span>
              SYSTEM ONLINE
            </div>

            <span className="version">
              v2.0
            </span>
          </div>

          <div className="card-heading">
            <h2>Create Account</h2>
            <p>Initialize your interview profile</p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Name */}
            <div className="input-group">
              <label>FULL NAME</label>

              <div className="input-wrapper">
                <span className="input-icon">◉</span>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="input-group">
              <label>EMAIL ADDRESS</label>

              <div className="input-wrapper">
                <span className="input-icon">@</span>

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

            {/* Password */}
            <div className="input-group">
              <label>PASSWORD</label>

              <div className="input-wrapper">
                <span className="input-icon">◆</span>

                <input
                  type="password"
                  name="password"
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Button */}
            <button
              className="register-button"
              type="submit"
              disabled={loading}
            >
              <span>
                {loading
                  ? "CREATING PROFILE..."
                  : "CREATE ACCOUNT"}
              </span>

              {!loading && <b>→</b>}
            </button>

          </form>

          {/* Message */}
          {message && (
            <div className="register-message">
              {message}
            </div>
          )}

          {/* Login */}
          <div className="login-link">
            <span>Already have an account?</span>

            <Link to="/login">
              Login →
            </Link>
          </div>

          {/* Security */}
          <div className="security">
            <span>🔒</span>
            <span>Your data is securely encrypted</span>
          </div>

        </div>

      </div>

      {/* Bottom Status */}
      <div className="system-status">
        <span></span>
        AI CORE ACTIVE
        <i></i>
        SECURE CONNECTION
      </div>

    </div>
  );
}

export default Register;