import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  BrainCircuit,
  Bell,
  BarChart3,
  LogOut,
  Menu,
  AlertTriangle,
  Clock,
  Activity,
} from "lucide-react";

import "./Dashboard.css";
import StatCard from "../components/StatCard";

function Dashboard() {
  return (
    <div className="dashboard-container">

      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-eye">
            👁
          </div>
          <div>
            <h2>MARG</h2>
            <span>Project Intelligence</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">

          <Link to="/dashboard" className="nav-item active">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>

          <Link to="/projects" className="nav-item">
            <FolderKanban size={20} />
            <span>Projects</span>
          </Link>

          <Link to="/predictions" className="nav-item">
            <BrainCircuit size={20} />
            <span>Predictions</span>
          </Link>

          <Link to="/alerts" className="nav-item">
            <Bell size={20} />
            <span>Alerts</span>
          </Link>

          <Link to="/analytics" className="nav-item">
            <BarChart3 size={20} />
            <span>Analytics</span>
          </Link>

        </nav>

        {/* Sidebar Bottom */}
        <div className="sidebar-bottom">

          <div className="user-box">
            <div className="user-avatar">
              U
            </div>

            <div>
              <strong>User</strong>
              <span>Government Authority</span>
            </div>
          </div>

          <Link to="/" className="logout-btn">
            <LogOut size={18} />
            Logout
          </Link>

        </div>

      </aside>


      {/* ================= MAIN CONTENT ================= */}

      <main className="dashboard-main">

        {/* Top Header */}
        <header className="dashboard-header">

          <div>
            <div className="mobile-menu">
              <Menu />
            </div>

            <p className="welcome-text">
              Welcome back 👋
            </p>

            <h1>
              Project Monitoring Dashboard
            </h1>

            <p className="header-description">
              Monitor project performance, predict risks and make
              data-driven decisions.
            </p>
          </div>

          <div className="header-date">
            <span>Last updated</span>
            <strong>Today, 10:30 AM</strong>
          </div>

        </header>


        {/* ================= STAT CARDS ================= */}

        <section className="stats-grid">

          <StatCard
            icon={FolderKanban}
            color="blue"
            label="Total Projects"
            value="1,981"
            change="8.2%"
            trend="up"
            description="Ongoing projects"
          />

          <StatCard
            icon={Activity}
            color="green"
            label="Projects On Track"
            value="1,426"
            change="5.4%"
            trend="up"
            description="72% of total projects"
          />

          <StatCard
            icon={AlertTriangle}
            color="orange"
            label="Projects At Risk"
            value="387"
            change="3.1%"
            trend="down"
            description="Requires attention"
          />

          <StatCard
            icon={Bell}
            color="red"
            label="Critical Alerts"
            value="168"
            change="+12"
            trend="down"
            description="Need immediate action"
          />

        </section>


        {/* ================= MIDDLE SECTION ================= */}

        <section className="dashboard-grid">

          {/* Risk Overview */}
          <div className="dashboard-card risk-overview">

            <div className="card-header">
              <div>
                <h3>Project Risk Overview</h3>
                <p>Current risk distribution</p>
              </div>

              <Link to="/predictions">
                View Predictions
              </Link>
            </div>


            <div className="risk-content">

              {/* Circle */}
              <div className="risk-circle">

                <div>
                  <strong>78%</strong>
                  <span>Healthy</span>
                </div>

              </div>


              {/* Risk Levels */}
              <div className="risk-levels">

                <div className="risk-row">
                  <span>
                    <i className="dot low"></i>
                    Low Risk
                  </span>
                  <strong>1,426</strong>
                </div>

                <div className="risk-row">
                  <span>
                    <i className="dot medium"></i>
                    Medium Risk
                  </span>
                  <strong>254</strong>
                </div>

                <div className="risk-row">
                  <span>
                    <i className="dot high"></i>
                    High Risk
                  </span>
                  <strong>219</strong>
                </div>

                <div className="risk-row">
                  <span>
                    <i className="dot critical"></i>
                    Critical
                  </span>
                  <strong>82</strong>
                </div>

              </div>

            </div>

          </div>


          {/* Prediction Summary */}
          <div className="dashboard-card prediction-card">

            <div className="card-header">

              <div>
                <h3>AI Risk Prediction</h3>
                <p>Upcoming project risks</p>
              </div>

              <BrainCircuit size={24} />

            </div>

            <div className="prediction-number">
              <strong>78%</strong>
              <span>Overall Project Health</span>
            </div>

            <div className="prediction-bar">
              <div></div>
            </div>

            <p className="prediction-text">
              MARG's AI models are continuously analyzing
              project cost, timeline and progress data.
            </p>

            <Link
              to="/predictions"
              className="prediction-button"
            >
              View AI Predictions
            </Link>

          </div>

        </section>


        {/* ================= PROJECTS ================= */}

        <section className="dashboard-card projects-card">

          <div className="card-header">

            <div>
              <h3>Recent Projects</h3>
              <p>Latest monitored infrastructure projects</p>
            </div>

            <Link to="/projects">
              View All Projects →
            </Link>

          </div>


          <div className="project-table">

            <div className="table-header">
              <span>Project</span>
              <span>Progress</span>
              <span>Risk</span>
              <span>Status</span>
            </div>


            {/* Project 1 */}
            <div className="project-row">

              <div className="project-name">
                <div className="project-icon">
                  <FolderKanban size={18} />
                </div>

                <div>
                  <strong>National Highway Development</strong>
                  <span>Transport Infrastructure</span>
                </div>
              </div>

              <div className="progress-container">

                <div className="progress-bar">
                  <div style={{ width: "82%" }}></div>
                </div>

                <span>82%</span>

              </div>

              <span className="risk-badge low-risk">
                LOW
              </span>

              <span className="status-badge on-track">
                On Track
              </span>

            </div>


            {/* Project 2 */}
            <div className="project-row">

              <div className="project-name">

                <div className="project-icon">
                  <FolderKanban size={18} />
                </div>

                <div>
                  <strong>Regional Railway Expansion</strong>
                  <span>Railway Infrastructure</span>
                </div>

              </div>

              <div className="progress-container">

                <div className="progress-bar">
                  <div style={{ width: "61%" }}></div>
                </div>

                <span>61%</span>

              </div>

              <span className="risk-badge medium-risk">
                MEDIUM
              </span>

              <span className="status-badge warning">
                Attention
              </span>

            </div>


            {/* Project 3 */}
            <div className="project-row">

              <div className="project-name">

                <div className="project-icon">
                  <FolderKanban size={18} />
                </div>

                <div>
                  <strong>Government Medical Complex</strong>
                  <span>Healthcare Infrastructure</span>
                </div>

              </div>

              <div className="progress-container">

                <div className="progress-bar">
                  <div style={{ width: "43%" }}></div>
                </div>

                <span>43%</span>

              </div>

              <span className="risk-badge high-risk">
                HIGH
              </span>

              <span className="status-badge danger">
                Delayed
              </span>

            </div>

          </div>

        </section>


        {/* ================= ALERTS ================= */}

        <section className="dashboard-card alerts-card">

          <div className="card-header">

            <div>
              <h3>Recent Alerts</h3>
              <p>Projects requiring attention</p>
            </div>

            <Link to="/alerts">
              View All Alerts →
            </Link>

          </div>


          <div className="alerts-list">

            <div className="alert-item">

              <div className="alert-icon critical">
                <AlertTriangle size={20} />
              </div>

              <div className="alert-info">
                <strong>
                  Cost overrun risk detected
                </strong>

                <span>
                  Government Medical Complex
                </span>
              </div>

              <span className="alert-time">
                2h ago
              </span>

            </div>


            <div className="alert-item">

              <div className="alert-icon warning">
                <Clock size={20} />
              </div>

              <div className="alert-info">
                <strong>
                  Possible schedule delay
                </strong>

                <span>
                  Regional Railway Expansion
                </span>
              </div>

              <span className="alert-time">
                5h ago
              </span>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;