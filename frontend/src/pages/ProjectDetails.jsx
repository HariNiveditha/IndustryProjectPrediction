import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  IndianRupee,
  CheckCircle2,
  Circle,
  Clock,
} from "lucide-react";
import "./Dashboard.css";

const PROJECTS = {
  1: { name: "NH-44 Widening Phase II", location: "Nagpur, MH", progress: 72, status: "on-track", deadline: "Dec 2026", budget: "₹142 Cr", spent: "₹98 Cr", risk: 24 },
  2: { name: "Godavari River Bridge", location: "Rajahmundry, AP", progress: 41, status: "at-risk", deadline: "Mar 2027", budget: "₹210 Cr", spent: "₹126 Cr", risk: 68 },
  3: { name: "Metro Corridor Extension", location: "Hyderabad, TS", progress: 88, status: "on-track", deadline: "Oct 2026", budget: "₹480 Cr", spent: "₹410 Cr", risk: 15 },
  4: { name: "Rural Water Pipeline", location: "Bidar, KA", progress: 23, status: "delayed", deadline: "Jan 2027", budget: "₹34 Cr", spent: "₹19 Cr", risk: 74 },
  5: { name: "Coastal Highway Repair", location: "Vizag, AP", progress: 100, status: "completed", deadline: "Completed", budget: "₹58 Cr", spent: "₹55 Cr", risk: 4 },
  6: { name: "Smart Traffic Signal Grid", location: "Pune, MH", progress: 55, status: "on-track", deadline: "Aug 2026", budget: "₹22 Cr", spent: "₹13 Cr", risk: 20 },
};

const MILESTONES = [
  { title: "Site survey & approvals", date: "Completed Jan 2026", state: "done" },
  { title: "Foundation & groundwork", date: "Completed May 2026", state: "done" },
  { title: "Structural construction", date: "In progress — target Nov 2026", state: "current" },
  { title: "Finishing & quality checks", date: "Scheduled Jan 2027", state: "pending" },
  { title: "Handover", date: "Scheduled Mar 2027", state: "pending" },
];

function statusLabel(status) {
  if (status === "on-track") return "On Track";
  if (status === "at-risk") return "At Risk";
  if (status === "delayed") return "Delayed";
  return "Completed";
}

function riskColor(risk) {
  if (risk >= 60) return "#ef4444";
  if (risk >= 30) return "#f59e0b";
  return "#22c55e";
}

function ProjectDetails() {
  const { id } = useParams();
  const [tab, setTab] = useState("overview");
  const project = PROJECTS[id] || PROJECTS[1];

  const ringOffset = 2 * Math.PI * 50 * (1 - project.risk / 100);

  return (
    <div>
      <Link to="/dashboard/projects" className="back-link">
        <ArrowLeft size={15} />
        Back to Projects
      </Link>

      <div className="page-header">
        <div>
          <h1>{project.name}</h1>
          <p>
            <MapPin size={13} style={{ display: "inline", marginRight: 4, verticalAlign: -2 }} />
            {project.location}
          </p>
        </div>
        <span className={`badge ${project.status}`} style={{ fontSize: 13, padding: "6px 14px" }}>
          {statusLabel(project.status)}
        </span>
      </div>

      <div className="stat-grid" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon blue"><Calendar size={18} /></div>
          </div>
          <div className="stat-value">{project.deadline}</div>
          <div className="stat-label">Target completion</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon green"><IndianRupee size={18} /></div>
          </div>
          <div className="stat-value">{project.budget}</div>
          <div className="stat-label">Total budget</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon amber"><IndianRupee size={18} /></div>
          </div>
          <div className="stat-value">{project.spent}</div>
          <div className="stat-label">Spent to date</div>
        </div>
      </div>

      <div className="tab-row">
        {["overview", "predictions", "milestones"].map((t) => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "overview" ? "Overview" : t === "predictions" ? "Risk Prediction" : "Milestones"}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="dashboard-grid-2">
          <div className="panel">
            <div className="panel-header">
              <h2>Progress</h2>
            </div>
            <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
              <span>Overall completion</span>
              <strong>{project.progress}%</strong>
            </div>
            <div className="progress-track" style={{ height: 10, marginBottom: 20 }}>
              <div className="progress-fill" style={{ width: `${project.progress}%` }} />
            </div>
            <p style={{ fontSize: 13.5, color: "#64748b", lineHeight: 1.6, margin: 0 }}>
              This project is currently in the structural construction phase.
              Based on current velocity, the team is tracking close to the
              planned schedule with manageable variance in material lead times.
            </p>
          </div>

          <div className="panel" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div className="panel-header" style={{ width: "100%" }}>
              <h2>Risk Score</h2>
            </div>
            <div className="risk-gauge">
              <div className="risk-ring">
                <svg viewBox="0 0 120 120" width="120" height="120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke={riskColor(project.risk)}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={ringOffset}
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="risk-ring-value">
                  <strong>{project.risk}%</strong>
                  <span>risk level</span>
                </div>
              </div>
              <p style={{ fontSize: 12.5, color: "#64748b", textAlign: "center", margin: 0 }}>
                {project.risk >= 60
                  ? "High risk — immediate attention recommended"
                  : project.risk >= 30
                  ? "Moderate risk — monitor closely"
                  : "Low risk — project is healthy"}
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === "predictions" && (
        <div className="panel">
          <div className="panel-header">
            <h2>AI Risk Factors</h2>
            <span className="confidence-pill">91% model confidence</span>
          </div>
          {[
            { label: "Cost overrun likelihood", value: 62, level: "high" },
            { label: "Schedule slippage risk", value: 45, level: "medium" },
            { label: "Weather / seasonal disruption", value: 30, level: "medium" },
            { label: "Material supply risk", value: 18, level: "low" },
          ].map((f) => (
            <div key={f.label}>
              <div className="factor-row">
                <span style={{ minWidth: 200 }}>{f.label}</span>
                <div className="factor-track">
                  <div className={`factor-fill ${f.level}`} style={{ width: `${f.value}%` }} />
                </div>
                <strong style={{ fontSize: 13, width: 34, textAlign: "right" }}>{f.value}%</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "milestones" && (
        <div className="panel">
          <div className="panel-header">
            <h2>Milestone Timeline</h2>
          </div>
          {MILESTONES.map((m, i) => (
            <div className="milestone" key={i}>
              <div className="milestone-line" />
              <div className={`milestone-dot ${m.state}`}>
                {m.state === "done" ? (
                  <CheckCircle2 size={14} />
                ) : m.state === "current" ? (
                  <Clock size={13} />
                ) : (
                  <Circle size={12} />
                )}
              </div>
              <div>
                <p className="milestone-title">{m.title}</p>
                <p className="milestone-date">{m.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectDetails;