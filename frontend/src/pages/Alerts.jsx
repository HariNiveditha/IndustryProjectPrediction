import React from "react";
import {
  AlertTriangle,
  CircleCheck,
  Clock3,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import "./Alerts.css";

const alerts = [
  {
    id: 1,
    project: "Hyderabad Regional Hospital",
    message:
      "Project expenditure is increasing faster than the planned budget.",
    level: "Critical",
    time: "12 mins ago",
    icon: ShieldAlert,
  },
  {
    id: 2,
    project: "National Highway Expansion",
    message:
      "Physical progress is 18% behind the scheduled completion timeline.",
    level: "High",
    time: "1 hour ago",
    icon: AlertTriangle,
  },
  {
    id: 3,
    project: "Metro Rail Phase II",
    message:
      "Recent milestone delays may increase the expected completion period.",
    level: "Medium",
    time: "3 hours ago",
    icon: Clock3,
  },
];

function Alerts() {
  return (
    <div className="alerts-page">

      {/* HEADER */}
      <div className="alerts-header">
        <div>
          <p className="section-label">PROJECT MONITORING</p>
          <h1>Alerts & Early Warnings</h1>
          <p>
            AI-powered notifications highlighting projects that may require
            immediate attention.
          </p>
        </div>

        <button className="refresh-btn">
          Refresh Alerts
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="alert-summary">

        <div className="alert-stat critical-stat">
          <div className="stat-icon">
            <ShieldAlert size={21} />
          </div>
          <div>
            <span>Critical</span>
            <strong>03</strong>
            <small>Immediate action</small>
          </div>
        </div>

        <div className="alert-stat high-stat">
          <div className="stat-icon">
            <AlertTriangle size={21} />
          </div>
          <div>
            <span>High Risk</span>
            <strong>07</strong>
            <small>Needs attention</small>
          </div>
        </div>

        <div className="alert-stat medium-stat">
          <div className="stat-icon">
            <Clock3 size={21} />
          </div>
          <div>
            <span>Medium Risk</span>
            <strong>12</strong>
            <small>Monitor closely</small>
          </div>
        </div>

        <div className="alert-stat resolved-stat">
          <div className="stat-icon">
            <CircleCheck size={21} />
          </div>
          <div>
            <span>Resolved</span>
            <strong>24</strong>
            <small>This month</small>
          </div>
        </div>

      </div>

      {/* MAIN CONTENT */}
      <div className="alerts-layout">

        {/* ALERT LIST */}
        <div className="alerts-card">

          <div className="alerts-card-header">
            <div>
              <h2>Active Alerts</h2>
              <p>Projects requiring monitoring or intervention</p>
            </div>

            <button className="filter-btn">
              All Alerts
            </button>
          </div>

          <div className="alert-list">

            {alerts.map((alert) => {
              const Icon = alert.icon;

              return (
                <div
                  className={`alert-item ${alert.level.toLowerCase()}`}
                  key={alert.id}
                >

                  <div className="alert-icon">
                    <Icon size={21} />
                  </div>

                  <div className="alert-content">

                    <div className="alert-top">
                      <div>
                        <span className="alert-project">
                          {alert.project}
                        </span>

                        <h3>{alert.message}</h3>
                      </div>

                      <span
                        className={`alert-badge ${alert.level.toLowerCase()}`}
                      >
                        {alert.level}
                      </span>
                    </div>

                    <div className="alert-bottom">
                      <span className="alert-time">
                        <Clock3 size={14} />
                        {alert.time}
                      </span>

                      <button className="view-alert">
                        View Project
                        <ArrowRight size={15} />
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}

          </div>

          <button className="view-all-btn">
            View All Alerts
            <ArrowRight size={16} />
          </button>

        </div>

        {/* AI RECOMMENDATION */}
        <div className="ai-alert-card">

          <div className="ai-heading">
            <div className="ai-icon">
              <Sparkles size={20} />
            </div>

            <div>
              <span>AI INSIGHT</span>
              <h2>Recommended Action</h2>
            </div>
          </div>

          <p className="ai-description">
            MARG has identified <strong>3 projects</strong> where early
            intervention could reduce the probability of cost escalation
            and schedule delays.
          </p>

          <div className="ai-recommendation">

            <div className="recommendation-number">
              01
            </div>

            <div>
              <h3>Review expenditure trend</h3>
              <p>
                Hyderabad Regional Hospital is showing an unusual increase
                in monthly expenditure compared with planned progress.
              </p>
            </div>

          </div>

          <button className="ai-action">
            Review Recommendations
            <ArrowRight size={16} />
          </button>

        </div>

      </div>

    </div>
  );
}

export default Alerts;