import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import "./Predictions.css";

function percent(value) {
  return value == null ? "Unavailable" : `${(value * 100).toFixed(2)}%`;
}

function Predictions() {
  const { id } = useParams();
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState(id ? decodeURIComponent(id) : "");
  const [data, setData] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [state, setState] = useState({ loading: true, error: "" });

  useEffect(() => {
    api.getProjects(100)
      .then((result) => {
        const items = result.items || [];
        const requested = id ? decodeURIComponent(id) : "";
        const requestedProject = items.find((project) => project.project_id === requested && project.prediction_available);
        const firstReady = items.find((project) => project.prediction_available);
        setProjects(items);
        setSelectedId(requestedProject?.project_id || firstReady?.project_id || "");
        if (!firstReady) setState({ loading: false, error: "No projects with usable prediction data are available." });
      })
      .catch((error) => setState({ loading: false, error: error.message }));
  }, [id]);

  useEffect(() => {
    if (!selectedId) return;
    const selectedProject = projects.find((project) => project.project_id === selectedId);
    setData(null);
    setExplanation(null);
    if (selectedProject && !selectedProject.prediction_available) {
      setState({ loading: false, error: "This project does not have enough complete snapshot features for predictions." });
      return;
    }
    setState({ loading: true, error: "" });
    Promise.all([api.getPrediction(selectedId), api.getExplanation(selectedId)])
      .then(([prediction, shap]) => {
        setData(prediction);
        setExplanation(shap);
        setState({ loading: false, error: "" });
      })
      .catch((error) => setState({ loading: false, error: error.message }));
  }, [selectedId, projects]);

  const unavailable = state.error.includes("does not have enough");
  return (
    <div className="predictions-page">
      <div className="page-header"><div><h1>AI Predictions</h1><p>Backend predictions for a selected real project.</p></div>
        <select className="analytics-filter" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
          <option value="">Select a project</option>
          {projects.map((project) => <option key={project.project_id} value={project.project_id}>{project.project_name || project.project_id}{project.prediction_available ? "" : " (prediction data unavailable)"}</option>)}
        </select>
      </div>
      {state.loading && <p>Loading prediction...</p>}
      {state.error && <p role="alert">{unavailable ? `Prediction data unavailable: ${state.error}` : `Unable to load prediction: ${state.error}`}</p>}
      {data && !state.error && <>
        <div className="prediction-card"><div className="prediction-top"><div><h2 className="list-row-title">Snapshot {data.snapshot_date}</h2><p className="alert-desc">Risk score: {data.risk.risk_score.toFixed(2)}</p></div><span className="confidence-pill">Backend computed</span></div>
          {[['Cost overrun probability', data.cost_overrun_target, 'high'], ['Time overrun probability', data.time_overrun_target, 'medium']].map(([label, target, color]) => <div className="factor-row" key={label}><span>{label}</span><div className="factor-track"><div className={`factor-fill ${color}`} style={{ width: `${target.probability * 100}%` }} /></div><strong>{percent(target.probability)}</strong></div>)}
          <p className="alert-desc">Warnings: {data.early_warnings.warning_exists ? data.early_warnings.warnings.map((warning) => warning.message).join(" ") : "No early warnings."}</p>
        </div>
        {explanation && <div className="prediction-card"><h2 className="list-row-title">Top SHAP contributors</h2>{['cost_overrun_target', 'time_overrun_target'].map((target) => <div key={target}><h3>{target}</h3>{explanation[target].top_contributors.map((item) => <div className="factor-row" key={`${target}-${item.feature_name}`}><span>{item.feature_name}</span><strong>{item.shap_value.toFixed(4)} ({item.contribution})</strong></div>)}</div>)}</div>}
      </>}
    </div>
  );
}

export default Predictions;
