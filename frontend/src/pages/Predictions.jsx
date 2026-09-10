import { useEffect, useState } from "react";
import { api } from "../api/client";
import "./Predictions.css";

function percent(value) {
  return value == null ? "Unavailable" : `${(value * 100).toFixed(2)}%`;
}

function Predictions() {
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [data, setData] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [state, setState] = useState({
    loading: true,
    error: "",
  });

  useEffect(() => {
    api
      .getProjects(100)
      .then((result) => {
        const items = result.items || [];
        setProjects(items);

        if (items.length > 0) {
          setSelectedId(String(items[0].project_id));
        } else {
          setState({
            loading: false,
            error: "No projects available.",
          });
        }
      })
      .catch((error) => {
        setState({
          loading: false,
          error: error.message,
        });
      });
  }, []);

  useEffect(() => {
    if (!selectedId) return;

    setState({
      loading: true,
      error: "",
    });

    Promise.all([
      api.getPrediction(selectedId),
      api.getExplanation(selectedId),
    ])
      .then(([prediction, shap]) => {
        setData(prediction);
        setExplanation(shap);

        setState({
          loading: false,
          error: "",
        });
      })
      .catch((error) => {
        setData(null);
        setExplanation(null);

        setState({
          loading: false,
          error: error.message,
        });
      });
  }, [selectedId]);

  return (
    <div className="predictions-page">
      <div className="page-header">
        <div>
          <h1>AI Predictions</h1>
          <p>Backend predictions for a selected real project.</p>
        </div>

        <select
          className="analytics-filter"
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
        >
          <option value="">Select a project</option>

          {projects.map((project) => (
            <option
              key={project.project_id}
              value={project.project_id}
            >
              {project.project_name || project.project_id}
            </option>
          ))}
        </select>
      </div>

      {state.loading && <p>Loading prediction...</p>}

      {state.error && (
        <p role="alert">
          Unable to load prediction: {state.error}
        </p>
      )}

      {data && !state.error && (
        <>
          <div className="prediction-card">
            <div className="prediction-top">
              <div>
                <h2 className="list-row-title">
                  Snapshot {data.snapshot_date}
                </h2>

                <p className="alert-desc">
                  Risk score: {data.risk.risk_score.toFixed(2)}
                </p>
              </div>

              <span className="confidence-pill">
                Backend computed
              </span>
            </div>

            <div className="factor-row">
              <span>Cost overrun probability</span>

              <div className="factor-track">
                <div
                  className="factor-fill high"
                  style={{
                    width: `${
                      data.cost_overrun_target.probability * 100
                    }%`,
                  }}
                />
              </div>

              <strong>
                {percent(
                  data.cost_overrun_target.probability
                )}
              </strong>
            </div>

            <div className="factor-row">
              <span>Time overrun probability</span>

              <div className="factor-track">
                <div
                  className="factor-fill medium"
                  style={{
                    width: `${
                      data.time_overrun_target.probability * 100
                    }%`,
                  }}
                />
              </div>

              <strong>
                {percent(
                  data.time_overrun_target.probability
                )}
              </strong>
            </div>

            <p className="alert-desc">
              Warnings:{" "}
              {data.early_warnings.warning_exists
                ? data.early_warnings.warnings
                    .map((warning) => warning.message)
                    .join(" ")
                : "No early warnings."}
            </p>
          </div>

          {explanation && (
            <div className="prediction-card">
              <h2 className="list-row-title">
                Top SHAP contributors
              </h2>

              {[
                "cost_overrun_target",
                "time_overrun_target",
              ].map((target) => (
                <div key={target}>
                  <h3>{target}</h3>

                  {explanation[target].top_contributors.map(
                    (item) => (
                      <div
                        className="factor-row"
                        key={`${target}-${item.feature_name}`}
                      >
                        <span>{item.feature_name}</span>

                        <strong>
                          {item.shap_value.toFixed(4)}{" "}
                          ({item.contribution})
                        </strong>
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Predictions;