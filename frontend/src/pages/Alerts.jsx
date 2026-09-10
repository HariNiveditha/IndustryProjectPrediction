import { useEffect, useState } from "react";
import { api } from "../api/client";
import "./Alerts.css";

function formatProbability(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return "Unavailable";
  }

  return `${(Number(value) * 100).toFixed(2)}%`;
}

function getPercentage(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return 0;
  }

  return Number(value) * 100;
}

function hasWarning(warnings, type) {
  return warnings?.some((warning) => warning.type === type);
}

function getRiskMessage(probability, type, positivePrediction) {
  const percentage = getPercentage(probability);

  if (positivePrediction) {
    if (type === "cost") {
      return `The ML model estimates a ${percentage.toFixed(
        2
      )}% likelihood of cost overrun. A cost-overrun warning has been generated for this project.`;
    }

    return `The ML model estimates a ${percentage.toFixed(
      2
    )}% likelihood of time overrun. A time-overrun warning has been generated for this project.`;
  }

  if (type === "cost") {
    return `The ML model estimates a ${percentage.toFixed(
      2
    )}% likelihood of cost overrun. No positive cost-overrun warning was generated.`;
  }

  return `The ML model estimates a ${percentage.toFixed(
    2
  )}% likelihood of time overrun. No positive time-overrun warning was generated.`;
}

function getStatusText(positivePrediction, type) {
  if (positivePrediction) {
    return type === "cost"
      ? "Cost attention required"
      : "Time attention required";
  }

  return type === "cost"
    ? "No cost-overrun warning"
    : "No time-overrun warning";
}

function Alerts() {
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [data, setData] = useState(null);

  const [state, setState] = useState({
    loading: true,
    error: "",
  });

  // --------------------------------------------------
  // LOAD PROJECTS
  // --------------------------------------------------

  useEffect(() => {
    api
      .getProjects(100)
      .then((result) => {
        const items = result.items || [];

        setProjects(items);

        const usableProject = items.find(
          (project) => project.prediction_available
        );

        if (usableProject) {
          setSelectedId(String(usableProject.project_id));
        } else {
          setState({
            loading: false,
            error:
              "No projects with usable alert data are available.",
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

  // --------------------------------------------------
  // LOAD ALERTS
  // --------------------------------------------------

  useEffect(() => {
    if (!selectedId) return;

    const selectedProject = projects.find(
      (project) =>
        String(project.project_id) === String(selectedId)
    );

    setData(null);

    if (
      selectedProject &&
      !selectedProject.prediction_available
    ) {
      setState({
        loading: false,
        error:
          "This project does not have enough complete snapshot features for alerts.",
      });

      return;
    }

    setState({
      loading: true,
      error: "",
    });

    api
      .getAlerts(selectedId)
      .then((result) => {
        setData(result);

        setState({
          loading: false,
          error: "",
        });
      })
      .catch((error) => {
        setData(null);

        setState({
          loading: false,
          error: error.message,
        });
      });
  }, [selectedId, projects]);

  const unavailable = state.error.includes(
    "does not have enough"
  );

  // --------------------------------------------------
  // EXTRACT ML OUTPUTS
  // --------------------------------------------------

  const warnings = data?.early_warnings?.warnings || [];

  const costProbability =
    data?.model_probabilities?.cost_overrun;

  const timeProbability =
    data?.model_probabilities?.time_overrun;

  const costWarning = hasWarning(
    warnings,
    "cost_overrun_prediction"
  );

  const timeWarning = hasWarning(
    warnings,
    "time_overrun_prediction"
  );

  return (
    <div className="alerts-page">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="alerts-header">

        <div>
          <p className="section-label">
            PROJECT MONITORING
          </p>

          <h1>Alerts & Early Warnings</h1>

          <p>
            AI-powered prediction signals and early
            warnings for the selected infrastructure project.
          </p>
        </div>

        <select
          className="analytics-filter"
          value={selectedId}
          onChange={(event) =>
            setSelectedId(event.target.value)
          }
        >
          <option value="">
            Select a project
          </option>

          {projects.map((project) => (
            <option
              key={project.project_id}
              value={project.project_id}
            >
              {project.project_name ||
                project.project_id}

              {!project.prediction_available &&
                " (alert data unavailable)"}
            </option>
          ))}
        </select>

      </div>


      {/* ================================================= */}
      {/* LOADING */}
      {/* ================================================= */}

      {state.loading && (
        <div className="alerts-message">
          Analyzing project data...
        </div>
      )}


      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {state.error && (
        <div className="alerts-message error-message">
          {unavailable
            ? `Alert data unavailable: ${state.error}`
            : `Unable to load alerts: ${state.error}`}
        </div>
      )}


      {data && !state.error && (
        <>

          {/* ================================================= */}
          {/* OVERALL PROJECT STATUS */}
          {/* ================================================= */}

          <div className="alerts-card">

            <div className="alerts-card-header">

              <div>
                <h2>Project Risk Overview</h2>

                <p>
                  Overall risk assessment generated from
                  the project's current monitoring signals.
                </p>
              </div>

              <div className="risk-score-display">
                <span>Risk Score</span>

                <strong>
                  {data.risk?.risk_score != null
                    ? Number(
                      data.risk.risk_score
                    ).toFixed(2)
                    : "—"}
                </strong>

                <small>out of 100</small>
              </div>

            </div>

          </div>


          {/* ================================================= */}
          {/* YOUR M2 ML OUTPUT */}
          {/* ================================================= */}

          <div className="alerts-card">

            <div className="alerts-card-header">

              <div>
                <h2>AI Prediction Signals</h2>

                <p>
                  Separate ML estimates for cost and
                  schedule overrun risk.
                </p>
              </div>

            </div>


            <div className="prediction-grid">

              {/* ========================================= */}
              {/* COST OVERRUN */}
              {/* ========================================= */}

              <div
                className={`prediction-box ${costWarning
                    ? "prediction-warning"
                    : ""
                  }`}
              >

                <div className="prediction-box-top">

                  <div>
                    <span className="prediction-label">
                      COST OVERRUN
                    </span>

                    <h3>
                      Cost Overrun Risk
                    </h3>
                  </div>

                  <div className="prediction-percentage">
                    {formatProbability(
                      costProbability
                    )}
                  </div>

                </div>


                <div className="prediction-bar">

                  <div
                    className="prediction-bar-fill"
                    style={{
                      width: `${Math.min(
                        getPercentage(
                          costProbability
                        ),
                        100
                      )}%`,
                    }}
                  />

                </div>


                <div className="prediction-status">

                  <strong>
                    {getStatusText(
                      costWarning,
                      "cost"
                    )}
                  </strong>

                </div>


                <p className="prediction-explanation">
                  {getRiskMessage(
                    costProbability,
                    "cost",
                    costWarning
                  )}
                </p>

              </div>


              {/* ========================================= */}
              {/* TIME OVERRUN */}
              {/* ========================================= */}

              <div
                className={`prediction-box ${timeWarning
                    ? "prediction-warning"
                    : ""
                  }`}
              >

                <div className="prediction-box-top">

                  <div>
                    <span className="prediction-label">
                      TIME OVERRUN
                    </span>

                    <h3>
                      Schedule Overrun Risk
                    </h3>
                  </div>

                  <div className="prediction-percentage">
                    {formatProbability(
                      timeProbability
                    )}
                  </div>

                </div>


                <div className="prediction-bar">

                  <div
                    className="prediction-bar-fill"
                    style={{
                      width: `${Math.min(
                        getPercentage(
                          timeProbability
                        ),
                        100
                      )}%`,
                    }}
                  />

                </div>


                <div className="prediction-status">

                  <strong>
                    {getStatusText(
                      timeWarning,
                      "time"
                    )}
                  </strong>

                </div>


                <p className="prediction-explanation">
                  {getRiskMessage(
                    timeProbability,
                    "time",
                    timeWarning
                  )}
                </p>

              </div>

            </div>

          </div>


          {/* ================================================= */}
          {/* EARLY WARNING EXPLANATION */}
          {/* ================================================= */}

          <div className="alerts-card">

            <div className="alerts-card-header">

              <div>
                <h2>Why is this project being flagged?</h2>

                <p>
                  The system converts model predictions
                  into understandable intervention signals.
                </p>
              </div>

            </div>


            {warnings.length === 0 ? (

              <div className="no-warning-box">

                <strong>
                  No active warning signals
                </strong>

                <p>
                  The current project snapshot did not
                  generate any supported early-warning
                  conditions.
                </p>

              </div>

            ) : (

              <div className="explanation-list">

                {warnings.map(
                  (warning, index) => {

                    let title =
                      "Project anomaly detected";

                    let explanation =
                      warning.message;

                    if (
                      warning.type ===
                      "cost_overrun_prediction"
                    ) {
                      title =
                        "Potential cost overrun";

                      explanation =
                        "The cost-overrun prediction model has identified a positive cost-overrun signal. The project should be monitored closely for further cost escalation.";
                    }

                    if (
                      warning.type ===
                      "time_overrun_prediction"
                    ) {
                      title =
                        "Potential schedule delay";

                      explanation =
                        "The time-overrun prediction model has identified a positive schedule-overrun signal. The project should be monitored closely for possible delay.";
                    }

                    if (
                      warning.type === "anomaly"
                    ) {
                      title =
                        "Unusual project behaviour";

                      explanation =
                        "The monitoring data contains one or more supported anomaly signals that require further investigation.";
                    }

                    return (
                      <div
                        className="explanation-item"
                        key={`${warning.type}-${index}`}
                      >

                        <div className="explanation-icon">
                          !
                        </div>

                        <div>

                          <strong>
                            {title}
                          </strong>

                          <p>
                            {explanation}
                          </p>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </div>


          {/* ================================================= */}
          {/* HOW TO READ THE RESULT */}
          {/* ================================================= */}

          <div className="alerts-card interpretation-card">

            <h2>
              How to interpret these predictions
            </h2>

            <div className="interpretation-grid">

              <div>
                <strong>
                  Cost Overrun Risk
                </strong>

                <p>
                  This percentage is the ML model's
                  estimated probability that the project
                  will experience a cost overrun based on
                  its current project features.
                </p>
              </div>


              <div>
                <strong>
                  Schedule Overrun Risk
                </strong>

                <p>
                  This percentage is the ML model's
                  estimated probability that the project
                  will experience a time overrun based on
                  its current project features.
                </p>
              </div>


              <div>
                <strong>
                  Early Warning
                </strong>

                <p>
                  A warning is generated when the system
                  identifies an explicit risk signal that
                  requires attention from project authorities.
                </p>
              </div>

            </div>

          </div>


          {/* ================================================= */}
          {/* SNAPSHOT */}
          {/* ================================================= */}

          <div className="alerts-footer">

            <span>
              Analysis based on snapshot:
            </span>

            <strong>
              {data.snapshot_date || "Unavailable"}
            </strong>

          </div>

        </>
      )}

    </div>
  );
}

export default Alerts;