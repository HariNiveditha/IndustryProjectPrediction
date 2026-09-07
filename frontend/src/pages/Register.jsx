import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!formData.role) {
      setError("Please select your role.");
      return;
    }

    try {
      // Backend connection will be added here
      console.log("Registration data:", formData);

      alert("Registration successful!");

      navigate("/login");

    } catch (error) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          👁
        </div>

        <h1>MARG</h1>

        <p className="auth-subtitle">
          Create your MARG account
        </p>

        <form onSubmit={handleRegister}>

          {/* Name */}
          <div className="form-group">
            <label>Full Name</label>

            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Role */}
          <div className="form-group">
            <label>Select your role</label>

            <div className="role-container">

              <button
                type="button"
                className={`role-option ${
                  formData.role === "contractor"
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setFormData({
                    ...formData,
                    role: "contractor",
                  })
                }
              >
                🏗️
                <span>Contractor</span>
              </button>

              <button
                type="button"
                className={`role-option ${
                  formData.role === "government"
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setFormData({
                    ...formData,
                    role: "government",
                  })
                }
              >
                🏛️
                <span>Government Authority</span>
              </button>

            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label>Confirm Password</label>

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-button"
          >
            Create Account
          </button>

        </form>

        <p className="switch-auth">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Register;