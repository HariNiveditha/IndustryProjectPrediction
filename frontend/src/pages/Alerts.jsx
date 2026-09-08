import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowUpRight } from "lucide-react";
import "./Dashboard.css";

const ALERTS = [
  { id: 1, projectId: 2, project: "Godavari River Bridge", title: "Budget overrun risk detected", desc: "Projected spend is trending 14% above baseline for this phase.", severity: "high", time: "2 hours ago" },
  { id: 2, projectId: 4, project: "Rural Water Pipeline", title: "Material delivery delayed 6 days", desc: "Pipe-fitting supplier reported a logistics delay affecting phase 3.", severity: "medium", time: "5 hours ago" },
  { id: 3, projectId: 1, project: "NH-44 Widening Phase II", title: "Weather disruption forecasted", desc: "Heavy rainfall expected next week may slow earthwork progress.", severity: "low", time: "1 day ago" },
  { id: 4, projectId: 2, project: "Godavari River Bridge", title: "Contractor workforce shortage", desc: "On-site labor count is 18% below planned staffing this month.", severity: "high", time: "1 day ago" },
  { id: 5, projectId: 3, project: "Metro Corridor Extension", title: "Inspection scheduled", desc: "Quality inspection for structural phase due in 3 days.", severity: "low", time: "2 days ago" },
  { id: 6, projectId: 6, project: "Smart Traffic Signal Grid", title: "Permit renewal required", desc: "Municipal permit for signal installation expires in 10 days.", severity: "medium", time: "3 days ago" },
];

const FILTERS = ["All", "High", "Medium", "Low"];

function Alerts() {
  const [filter, setFilter] = useState("All");

  const filtered =
    filter === "All"
      ? ALERTS
      : ALERTS.filter((a) => a.severity === filter.toLowerCase());

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Alerts</h1>
          <p>{ALERTS.length} alerts across your project portfolio.</p>
        </div>
      </div>

      <div className="projects-toolbar">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-pill ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="panel">
        {filtered.map((a) => (
          <div className="alert-item" key={a.id}>
            <div className={`alert-icon sev-${a.severity}`}>
              <ShieldAlert size={17} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <p className="alert-title">{a.title}</p>
                <span className="alert-time">{a.time}</span>
              </div>
              <p className="alert-desc">{a.desc}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className={`badge sev-${a.severity}`}>
                  {a.severity === "high" ? "High" : a.severity === "medium" ? "Medium" : "Low"} severity
                </span>
                <Link
                  to={`/dashboard/projects/${a.projectId}`}
                  className="panel-link"
                  style={{ display: "inline-flex", alignItems: "center", gap: 3 }}
                >
                  {a.project} <ArrowUpRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Alerts;