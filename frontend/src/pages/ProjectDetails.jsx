import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, IndianRupee } from "lucide-react";
import { api } from "../api/client";
import "./Dashboard.css";

function formatValue(value) {
  return value == null ? "Unavailable" : String(value);
}

function ProjectDetails() {
  const { id } = useParams();
  const projectId = decodeURIComponent(id || "");
  const [project, setProject] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });

  useEffect(() => {
    Promise.all([api.getProject(projectId), api.getSnapshots(projectId)])
      .then(([projectData, snapshotData]) => {
        setProject(projectData);
        setSnapshots(snapshotData.items || []);
        setState({ loading: false, error: "" });
      })
      .catch((error) => setState({ loading: false, error: error.message }));
  }, [projectId]);

  const latest = useMemo(() => snapshots[snapshots.length - 1], [snapshots]);
  if (state.loading) return <div className="dashboard-main"><p>Loading project...</p></div>;
  if (state.error) return <div className="dashboard-main"><p role="alert">Unable to load project: {state.error}</p></div>;
  if (!project) return <div className="dashboard-main"><p>Project not found.</p></div>;

  return (
    <div className="dashboard-main">
      <Link to="/projects" className="back-link"><ArrowLeft size={15} />Back to Projects</Link>
      <div className="page-header">
        <div><h1>{project.project_name || project.project_id}</h1><p>{project.project_id}</p></div>
      </div>
      <div className="stat-grid" style={{ marginBottom: 22 }}>
        <div className="stat-card"><div className="stat-value">{formatValue(latest?.physical_progress_pct)}{latest?.physical_progress_pct != null ? "%" : ""}</div><div className="stat-label">Latest physical progress</div></div>
        <div className="stat-card"><div className="stat-value">{formatValue(latest?.original_cost_cr)}</div><div className="stat-label">Original cost (Cr)</div></div>
        <div className="stat-card"><div className="stat-value">{formatValue(latest?.cumulative_expenditure_cr)}</div><div className="stat-label">Cumulative expenditure (Cr)</div></div>
      </div>
      <div className="panel">
        <div className="panel-header"><div><h2>Snapshot history</h2><p>{snapshots.length} snapshots returned in chronological order.</p></div><Calendar size={20} /></div>
        {snapshots.length === 0 ? <p>No snapshots found.</p> : <div className="project-table"><div className="table-header"><span>Date</span><span>Progress</span><span>Expenditure</span><span>Revised cost</span></div>{snapshots.map((snapshot) => <div className="project-row" key={`${snapshot.project_id}-${snapshot.snapshot_date}`}><div className="project-name"><div><strong>{formatValue(snapshot.snapshot_date)}</strong></div></div><span>{formatValue(snapshot.physical_progress_pct)}{snapshot.physical_progress_pct != null ? "%" : ""}</span><span><IndianRupee size={13} /> {formatValue(snapshot.cumulative_expenditure_cr)}</span><span>{formatValue(snapshot.revised_cost_cr)}</span></div>)}</div>}
      </div>
    </div>
  );
}

export default ProjectDetails;
