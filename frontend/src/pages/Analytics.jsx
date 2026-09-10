import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, IndianRupee, TrendingUp } from "lucide-react";
import { api } from "../api/client";
import "./Analytics.css";

function value(number) { return number == null ? "Unavailable" : Number(number).toLocaleString(undefined, { maximumFractionDigits: 2 }); }

function percentage(valueToFormat) {
  return valueToFormat == null ? 0 : Math.min(100, Math.max(0, Number(valueToFormat)));
}

function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { api.getAnalyticsSummary().then(setData).catch((requestError) => setError(requestError.message)); }, []);

  const costs = data ? [
    { label: "Original cost", value: Number(data.total_original_cost_cr) || 0, className: "original" },
    { label: "Revised cost", value: Number(data.total_revised_cost_cr) || 0, className: "revised" },
    { label: "Expenditure", value: Number(data.total_cumulative_expenditure_cr) || 0, className: "expenditure" },
  ] : [];
  const largestCost = Math.max(...costs.map((cost) => cost.value), 1);
  const progress = percentage(data?.average_physical_progress_pct);

  return <div className="analytics-page"><div className="analytics-header"><div><h1>Project Analytics</h1><p>Aggregates calculated from stored MongoDB snapshots.</p></div></div>{error && <p role="alert">Unable to load analytics: {error}</p>}{!data && !error && <p>Loading analytics...</p>}{data && <><div className="analytics-stats"><div className="analytics-stat-card"><div className="stat-icon blue"><TrendingUp size={22} /></div><div><span>Total Projects</span><h2>{value(data.total_projects)}</h2></div></div><div className="analytics-stat-card"><div className="stat-icon green"><CheckCircle size={22} /></div><div><span>Total Snapshots</span><h2>{value(data.total_snapshots)}</h2></div></div><div className="analytics-stat-card"><div className="stat-icon orange"><AlertTriangle size={22} /></div><div><span>Average Progress</span><h2>{value(data.average_physical_progress_pct)}%</h2></div></div><div className="analytics-stat-card"><div className="stat-icon purple"><IndianRupee size={22} /></div><div><span>Expenditure (Cr)</span><h2>{value(data.total_cumulative_expenditure_cr)}</h2></div></div></div><div className="analytics-chart-grid"><section className="analytics-card cost-chart-card"><div className="card-header"><div><h3>Cost comparison</h3><p>Aggregate values in crore rupees</p></div><span className="chart-period">All snapshots</span></div><div className="cost-chart" role="img" aria-label="Comparison of original cost, revised cost, and expenditure">{costs.map((cost) => <div className="cost-chart-row" key={cost.label}><div className="cost-chart-label"><span>{cost.label}</span><strong>{value(cost.value)} Cr</strong></div><div className="cost-chart-track"><div className={`cost-chart-bar ${cost.className}`} style={{ width: `${(cost.value / largestCost) * 100}%` }} /></div></div>)}</div></section><section className="analytics-card progress-chart-card"><div className="card-header"><div><h3>Physical progress</h3><p>Average across stored snapshots</p></div></div><div className="progress-chart" role="img" aria-label={`Average physical progress is ${value(data.average_physical_progress_pct)} percent`}><div className="progress-ring" style={{ "--progress": `${progress}%` }}><div><strong>{value(data.average_physical_progress_pct)}%</strong><span>complete</span></div></div><div className="progress-scale"><span>0%</span><span>100%</span></div></div></section></div><div className="analytics-grid"><div className="analytics-card large"><div className="card-header"><div><h3>Stored dataset window</h3><p>Snapshot dates available in MongoDB</p></div></div><p>{data.first_snapshot_date || "Unavailable"} to {data.latest_snapshot_date || "Unavailable"}</p><h2>{data.unique_snapshot_dates} distinct snapshot dates</h2></div><div className="analytics-card"><div className="card-header"><div><h3>Cost totals</h3><p>Aggregated from snapshots</p></div></div><p>Original: {value(data.total_original_cost_cr)} Cr</p><p>Revised: {value(data.total_revised_cost_cr)} Cr</p><p>Expenditure: {value(data.total_cumulative_expenditure_cr)} Cr</p></div></div></>}</div>;
}

export default Analytics;
