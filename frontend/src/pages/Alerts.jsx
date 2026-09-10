import { useEffect, useState } from "react";
import { api } from "../api/client";
import "./Alerts.css";

function Alerts() {
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [data, setData] = useState(null);
  const [state, setState] = useState({ loading: true, error: "" });
  useEffect(() => { api.getProjects(100).then((result) => { setProjects(result.items || []); if (result.items?.[0]) setSelectedId(result.items[0].project_id); }).catch((error) => setState({ loading: false, error: error.message })); }, []);
  useEffect(() => { if (!selectedId) return; api.getAlerts(selectedId).then((result) => { setData(result); setState({ loading: false, error: "" }); }).catch((error) => setState({ loading: false, error: error.message })); }, [selectedId]);
  return <div className="alerts-page"><div className="alerts-header"><div><p className="section-label">PROJECT MONITORING</p><h1>Alerts & Early Warnings</h1><p>Current backend-derived alerts for a selected project.</p></div><select className="analytics-filter" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}><option value="">Select a project</option>{projects.map((project) => <option key={project.project_id} value={project.project_id}>{project.project_name || project.project_id}</option>)}</select></div>{state.loading && <p>Loading alerts...</p>}{state.error && <p role="alert">Unable to load alerts: {state.error}</p>}{data && !state.error && <div className="alerts-card"><div className="alerts-card-header"><div><h2>{data.early_warnings.warning_exists ? "Active warnings" : "No active warnings"}</h2><p>Risk score: {data.risk.risk_score.toFixed(2)}</p></div></div>{data.early_warnings.warnings.length === 0 ? <p>This project has no backend-derived warning signals.</p> : <div className="alert-list">{data.early_warnings.warnings.map((warning) => <div className="alert-item" key={warning.type}><div className="alert-info"><strong>{warning.type}</strong><span>{warning.message}</span></div></div>)}</div>}</div>}</div>;
}

export default Alerts;
