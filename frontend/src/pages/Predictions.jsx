import { useState } from "react";
import RiskCard from "../components/RiskCard";
import "./Predictions.css";

function Predictions() {
  const [formData, setFormData] = useState({
    project: "",
    original_cost_cr: "",
    revised_cost_cr: "",
    cumulative_expenditure_cr: "",
    physical_progress_pct: "",
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePredict = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setPrediction(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          original_cost_cr: Number(formData.original_cost_cr),
          revised_cost_cr: Number(formData.revised_cost_cr),
          cumulative_expenditure_cr: Number(
            formData.cumulative_expenditure_cr
          ),
          physical_progress_pct: Number(formData.physical_progress_pct),
        }),
      });

      if (!response.ok) {
        throw new Error("Prediction request failed");
      }

      const data = await response.json();

      setPrediction(data);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to connect to the prediction server. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const getLevel = (value) => {
    if (value >= 85) return "critical";
    if (value >= 65) return "high";
    if (value >= 40) return "medium";
    return "low";
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>AI Predictions</h1>
          <p>
            Enter project details to generate an AI-powered risk prediction.
          </p>
        </div>
      </div>

      {/* Prediction Form */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-5">
          Project Information
        </h2>

        <form onSubmit={handlePredict} className="space-y-4">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Project Name
            </label>

            <input
              type="text"
              name="project"
              value={formData.project}
              onChange={handleChange}
              placeholder="Enter project name"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* Original Cost */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Original Cost (₹ Crores)
            </label>

            <input
              type="number"
              name="original_cost_cr"
              value={formData.original_cost_cr}
              onChange={handleChange}
              placeholder="e.g. 100"
              min="0"
              step="any"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* Revised Cost */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Revised Cost (₹ Crores)
            </label>

            <input
              type="number"
              name="revised_cost_cr"
              value={formData.revised_cost_cr}
              onChange={handleChange}
              placeholder="e.g. 110"
              min="0"
              step="any"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* Cumulative Expenditure */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cumulative Expenditure (₹ Crores)
            </label>

            <input
              type="number"
              name="cumulative_expenditure_cr"
              value={formData.cumulative_expenditure_cr}
              onChange={handleChange}
              placeholder="e.g. 50"
              min="0"
              step="any"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* Physical Progress */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Physical Progress (%)
            </label>

            <input
              type="number"
              name="physical_progress_pct"
              value={formData.physical_progress_pct}
              onChange={handleChange}
              placeholder="e.g. 40"
              min="0"
              max="100"
              step="any"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* Predict Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Predicting..." : "Predict Risk"}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-6 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Prediction Result */}
      {prediction && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Prediction Result
          </h2>

          <RiskCard
            id={null}
            project={formData.project}
            confidence={prediction.risk_score}
            summary={`Overall project risk is ${prediction.risk_level}. Cost risk is ${prediction.cost_risk}% and delay risk is ${prediction.delay_risk}%.`}
            factors={[
              {
                label: "Cost overrun likelihood",
                value: prediction.cost_risk,
                level: getLevel(prediction.cost_risk),
              },
              {
                label: "Schedule slippage risk",
                value: prediction.delay_risk,
                level: getLevel(prediction.delay_risk),
              },
            ]}
          />

          {/* Overall Risk */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm mt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Overall Risk Score
                </p>

                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {prediction.risk_score}
                </p>
              </div>

              <span
                className={`px-4 py-2 rounded-full text-sm font-bold ${
                  prediction.risk_level === "LOW"
                    ? "bg-green-100 text-green-700"
                    : prediction.risk_level === "MEDIUM"
                    ? "bg-orange-100 text-orange-700"
                    : prediction.risk_level === "HIGH"
                    ? "bg-red-100 text-red-700"
                    : "bg-red-200 text-red-800"
                }`}
              >
                {prediction.risk_level}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Predictions;