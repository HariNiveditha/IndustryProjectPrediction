import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Building2,
  Landmark,
  AlertCircle,
  ArrowRight,
  Target,
  BarChart3,
} from "lucide-react";
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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      {/* Left brand panel */}
      <div className="auth-brand">
        <div className="auth-brand-top">
          <div className="auth-brand-logo">
            <Eye size={20} strokeWidth={2.5} />
          </div>
          <span className="auth-brand-name">MARG</span>
        </div>

        <div className="auth-brand-middle">
          <div className="auth-brand-emblem">
            <Eye size={40} strokeWidth={2} />
          </div>
          <h2>Join a smarter way to monitor infrastructure.</h2>
          <p>
            Create your account to get AI-powered risk predictions and
            transparent project tracking, built for contractors and
            government authorities alike.
          </p>
        </div>

        <div className="auth-brand-points">
          <div className="auth-brand-point">
            <span className="auth-brand-point-dot">
              <Target size={13} />
            </span>
            Identify cost and time risks early
          </div>
          <div className="auth-brand-point">
            <span className="auth-brand-point-dot">
              <BarChart3 size={13} />
            </span>
            Make decisions backed by live data
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-card-mobile-logo">
            <Eye size={22} strokeWidth={2.5} />
          </div>

          <h1>Create your account</h1>
          <p className="auth-subtitle">Create your MARG account</p>

          <form onSubmit={handleRegister}>
            {/* Name */}
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <User size={17} />
                </span>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label>Email</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <Mail size={17} />
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Role */}
            <div className="form-group">
              <label>Select your role</label>

              <div className="role-container">
                <button
                  type="button"
                  className={`role-option ${
                    formData.role === "contractor" ? "selected" : ""
                  }`}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      role: "contractor",
                    })
                  }
                >
                  <Building2 size={22} />
                  <span>Contractor</span>
                </button>

                <button
                  type="button"
                  className={`role-option ${
                    formData.role === "government" ? "selected" : ""
                  }`}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      role: "government",
                    })
                  }
                >
                  <Landmark size={22} />
                  <span>Government Authority</span>
                </button>
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <Lock size={17} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <Lock size={17} />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="error-message">
                <AlertCircle size={15} />
                {error}
              </p>
            )}

            <button type="submit" className="auth-button">
              Create Account
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="switch-auth">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;