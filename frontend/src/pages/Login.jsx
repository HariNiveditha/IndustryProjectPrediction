import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Mail, Lock, EyeOff, AlertCircle, ArrowRight, ShieldCheck, TrendingUp } from "lucide-react";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    try {
      // Backend authentication will be connected here
      console.log("Login:", email, password);

      // Temporary navigation
      navigate("/dashboard");
    } catch (error) {
      setError("Invalid email or password.");
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
          <h2>Predict risks before they become delays.</h2>
          <p>
            Log in to track project health, monitor progress, and act on
            real-time insights across your infrastructure portfolio.
          </p>
        </div>

        <div className="auth-brand-points">
          <div className="auth-brand-point">
            <span className="auth-brand-point-dot">
              <ShieldCheck size={13} />
            </span>
            Proactive monitoring & early alerts
          </div>
          <div className="auth-brand-point">
            <span className="auth-brand-point-dot">
              <TrendingUp size={13} />
            </span>
            Real-time analytics dashboards
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-card-mobile-logo">
            <Eye size={22} strokeWidth={2.5} />
          </div>

          <h1>Welcome back</h1>
          <p className="auth-subtitle">Login to your MARG account</p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <Mail size={17} />
                </span>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <Lock size={17} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {error && (
              <p className="error-message">
                <AlertCircle size={15} />
                {error}
              </p>
            )}

            <button type="submit" className="auth-button">
              Login
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="switch-auth">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;