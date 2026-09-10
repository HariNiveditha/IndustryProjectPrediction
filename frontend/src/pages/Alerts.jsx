import { useEffect, useState } from "react";
import { api } from "../api/client";
import "./Alerts.css";

function Alerts() {
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [data, setData] = useState(null);
  const [state, setState] = useState({ loading: true, error: "" });

  useEffect(() => {
    api.getProjects(100)
      .then((result) => {
        const items = result.items || [];
        setProjects(items);
        setSelectedId(items.find((project) => project.prediction_available)?.project_id || "");
        if (!items.some((project) => project.prediction_available)) setState({ loading: false, error: "No projects with usable alert data are available." });
      })
      .catch((error) => setState({ loading: false, error: error.message }));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const selectedProject = projects.find((project) => project.project_id === selectedId);
    setData(null);
    if (selectedProject && !selectedProject.prediction_available) {
      setState({ loading: false, error: "This project does not have enough complete snapshot features for alerts." });
      return;
    }
    setState({ loading: true, error: "" });
    api.getAlerts(selectedId)
      .then((result) => { setData(result); setState({ loading: false, error: "" }); })
      .catch((error) => setState({ loading: false, error: error.message }));
  }, [selectedId, projects]);

  const unavailable = state.error.includes("does not have enough");
  return (
    <div className="alerts-page">
      <div className="alerts-header"><div><p className="section-label">PROJECT MONITORING</p><h1>Alerts & Early Warnings</h1><p>Current backend-derived alerts for a selected project.</p></div>
        <select className="analytics-filter" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
          <option value="">Select a project</option>
          {projects.map((project) => <option key={project.project_id} value={project.project_id}>{project.project_name || project.project_id}{project.prediction_available ? "" : " (alert data unavailable)"}</option>)}
        </select>
      </div>
      {state.loading && <p>Loading alerts...</p>}
      {state.error && <p role="alert">{unavailable ? `Alert data unavailable: ${state.error}` : `Unable to load alerts: ${state.error}`}</p>}
      {data && !state.error && <div className="alerts-card"><div className="alerts-card-header"><div><h2>{data.early_warnings.warning_exists ? "Active warnings" : "No active warnings"}</h2><p>Risk score: {data.risk.risk_score.toFixed(2)}</p></div></div>{data.early_warnings.warnings.length === 0 ? <p>This project has no backend-derived warning signals.</p> : <div className="alert-list">{data.early_warnings.warnings.map((warning) => <div className="alert-item" key={warning.type}><div className="alert-info"><strong>{warning.type}</strong><span>{warning.message}</span></div></div>)}</div>}</div>}
    </div>
  );
}

export default Alerts;
