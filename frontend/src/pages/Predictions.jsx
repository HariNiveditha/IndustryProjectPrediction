import RiskCard from "../components/RiskCard";
import "./Predictions.css";

const PREDICTIONS = [
  {
    id: 2,
    project: "Godavari River Bridge",
    confidence: 91,
    summary:
      "High likelihood of cost overrun due to fluctuating steel prices and a compressed monsoon working window.",
    factors: [
      { label: "Cost overrun likelihood", value: 68, level: "high" },
      { label: "Schedule slippage risk", value: 52, level: "medium" },
    ],
  },
  {
    id: 4,
    project: "Rural Water Pipeline",
    confidence: 87,
    summary:
      "Delays in pipe-fitting material delivery are pushing the current phase 3 weeks behind the baseline schedule.",
    factors: [
      { label: "Material supply risk", value: 74, level: "high" },
      { label: "Schedule slippage risk", value: 61, level: "high" },
    ],
  },
  {
    id: 1,
    project: "NH-44 Widening Phase II",
    confidence: 94,
    summary:
      "Overall trajectory is healthy; minor weather-related slippage possible in Q4 but unlikely to affect the deadline.",
    factors: [
      { label: "Weather disruption", value: 30, level: "medium" },
      { label: "Cost overrun likelihood", value: 12, level: "low" },
    ],
  },
  {
    id: 6,
    project: "Smart Traffic Signal Grid",
    confidence: 89,
    summary:
      "Procurement of signal controllers is on schedule; no significant risk factors detected this cycle.",
    factors: [
      { label: "Cost overrun likelihood", value: 15, level: "low" },
      { label: "Schedule slippage risk", value: 10, level: "low" },
    ],
  },
];

function Predictions() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>AI Predictions</h1>
          <p>Model-generated risk forecasts across your active projects.</p>
        </div>
      </div>

      {PREDICTIONS.map((p) => (
        <RiskCard key={p.id} {...p} />
      ))}
    </div>
  );
}

export default Predictions;