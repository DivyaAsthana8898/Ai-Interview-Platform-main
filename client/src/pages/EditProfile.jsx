import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function EditProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    skills: "",
    targetRole: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load current profile
  useEffect(() => {
    const getProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        // No token
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await API.get(
          "/user/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const user = response.data.user;

        setFormData({
          name: user.name || "",
          skills: user.skills
            ? user.skills.join(", ")
            : "",
          targetRole: user.targetRole || "",
        });
      } catch (error) {
        console.log(
          "Profile Error:",
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

        setError(
          error.response?.data?.message ||
            "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [navigate]);

  // Input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Update profile
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      // No token
      if (!token) {
        navigate("/login");
        return;
      }

      const skillsArray = formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);

      const response = await API.put(
        "/user/profile",
        {
          name: formData.name,
          skills: skillsArray,
          targetRole: formData.targetRole,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Profile Updated:",
        response.data
      );

      setMessage(
        response.data.message ||
          "Profile updated successfully!"
      );

      // Automatically go back to Profile
      setTimeout(() => {
        navigate("/profile");
      }, 1000);
    } catch (error) {
      console.log(
        "Update Profile Error:",
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

      setError(
        error.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div>
        <h2>Loading Profile...</h2>
      </div>
    );
  }

  return (
    <div>
      <h1>Edit Profile</h1>

      {message && (
        <p>
          ✅ {message}
        </p>
      )}

      {error && (
        <p>
          ❌ {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>

        {/* Name */}
        <label>
          <strong>Name</strong>
        </label>

        <br />

        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your name"
          required
        />

        <br />
        <br />

        {/* Skills */}
        <label>
          <strong>Skills</strong>
        </label>

        <br />

        <input
          type="text"
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          placeholder="Python, JavaScript, React"
        />

        <br />

        <small>
          Separate skills using commas.
        </small>

        <br />
        <br />

        {/* Target Role */}
        <label>
          <strong>Target Role</strong>
        </label>

        <br />

        <input
          type="text"
          name="targetRole"
          value={formData.targetRole}
          onChange={handleChange}
          placeholder="Backend Developer"
        />

        <br />
        <br />

        <button
          type="submit"
          disabled={saving}
        >
          {saving
            ? "Updating Profile..."
            : "Update Profile"}
        </button>

      </form>

      <br />

      <button
        onClick={() => navigate("/profile")}
        disabled={saving}
      >
        ← Back to Profile
      </button>

    </div>
  );
}

export default EditProfile;