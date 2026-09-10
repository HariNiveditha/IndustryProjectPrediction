import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  IndianRupee,
  CheckCircle2,
  Circle,
  Clock,
} from "lucide-react";

import { api } from "../api/client";
import "./Dashboard.css";


function statusLabel(status) {
  if (!status) return "Unknown";

  const normalized = String(status).toLowerCase();

  if (normalized === "on-track" || normalized === "on track") {
    return "On Track";
  }

  if (normalized === "at-risk" || normalized === "at risk") {
    return "At Risk";
  }

  if (normalized === "delayed") {
    return "Delayed";
  }

  if (normalized === "completed" || normalized === "complete") {
    return "Completed";
  }

  return status;
}


function riskColor(risk) {
  const value = Number(risk) || 0;

  if (value >= 60) return "#ef4444";
  if (value >= 30) return "#f59e0b";
  return "#22c55e";
}


function formatCurrency(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return `₹${number.toLocaleString("en-IN")}`;
}


function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}


function getProgress(project, snapshot) {
  return Number(
    snapshot?.physical_progress ??
      snapshot?.physicalProgress ??
      project?.physical_progress ??
      project?.physicalProgress ??
      project?.progress ??
      0
  );
}


function getBudget(project, snapshot) {
  return (
    snapshot?.original_cost ??
    snapshot?.originalCost ??
    project?.original_cost ??
    project?.originalCost ??
    project?.budget ??
    null
  );
}


function getSpent(project, snapshot) {
  return (
    snapshot?.cumulative_expenditure ??
    snapshot?.cumulativeExpenditure ??
    project?.cumulative_expenditure ??
    project?.cumulativeExpenditure ??
    project?.spent ??
    null
  );
}


function getDeadline(project) {
  return (
    project?.target_completion_date ??
    project?.targetCompletionDate ??
    project?.completion_date ??
    project?.completionDate ??
    project?.deadline ??
    null
  );
}


function ProjectDetails() {
  const { id } = useParams();

  const projectId = decodeURIComponent(id || "");

  const [tab, setTab] = useState("overview");

  const [project, setProject] = useState(null);
  const [snapshots, setSnapshots] = useState([]);

  const [riskData, setRiskData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [riskLoading, setRiskLoading] = useState(true);

  const [error, setError] = useState("");


  /*
   * ---------------------------------------------------------
   * LOAD PROJECT + SNAPSHOTS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    let cancelled = false;

    async function loadProject() {
      try {
        setLoading(true);
        setError("");

        const [projectResponse, snapshotsResponse] =
          await Promise.all([
            api.getProject(projectId),
            api.getSnapshots(projectId),
          ]);

        if (cancelled) return;

        setProject(projectResponse || null);

        const snapshotData =
          snapshotsResponse?.snapshots ??
          snapshotsResponse?.data ??
          snapshotsResponse ??
          [];

        setSnapshots(
          Array.isArray(snapshotData)
            ? snapshotData
            : []
        );
      } catch (err) {
        console.error("Failed to load project:", err);

        if (!cancelled) {
          setError(
            err?.message ||
              "Failed to load project details."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (projectId) {
      loadProject();
    }

    return () => {
      cancelled = true;
    };
  }, [projectId]);


  /*
   * ---------------------------------------------------------
   * LOAD M3 RISK DATA
   * ---------------------------------------------------------
   *
   * Keep the M3 risk API separate from the main project API.
   * This means the new backend project structure and the M3
   * risk engine can work together.
   */

  useEffect(() => {
    let cancelled = false;

    async function loadRisk() {
      try {
        setRiskLoading(true);

        /*
         * M3 risk endpoint.
         *
         * The old M3 page used:
         * /projects/101/risk
         *
         * Here we use the actual project ID from the URL.
         */

        const response = await fetch(
          `http://127.0.0.1:8000/projects/${encodeURIComponent(
            projectId
          )}/risk`
        );

        if (!response.ok) {
          throw new Error(
            `Risk API returned ${response.status}`
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setRiskData(data);
        }
      } catch (err) {
        console.error(
          "Failed to fetch risk data:",
          err
        );

        if (!cancelled) {
          setRiskData(null);
        }
      } finally {
        if (!cancelled) {
          setRiskLoading(false);
        }
      }
    }

    if (projectId) {
      loadRisk();
    }

    return () => {
      cancelled = true;
    };
  }, [projectId]);


  /*
   * ---------------------------------------------------------
   * LATEST SNAPSHOT
   * ---------------------------------------------------------
   */

  const latestSnapshot = useMemo(() => {
    if (!Array.isArray(snapshots) || snapshots.length === 0) {
      return null;
    }

    return snapshots[snapshots.length - 1];
  }, [snapshots]);


  /*
   * ---------------------------------------------------------
   * PROJECT VALUES
   * ---------------------------------------------------------
   */

  const progress = getProgress(
    project,
    latestSnapshot
  );

  const budget = getBudget(
    project,
    latestSnapshot
  );

  const spent = getSpent(
    project,
    latestSnapshot
  );

  const deadline = getDeadline(project);

  const projectName =
    project?.project_name ||
    project?.projectName ||
    project?.name ||
    project?.project_id ||
    project?.projectId ||
    projectId;

  const location =
    project?.location ||
    [
      project?.district,
      project?.state,
    ]
      .filter(Boolean)
      .join(", ") ||
    "Location unavailable";

  const status =
    project?.status ||
    project?.project_status ||
    project?.projectStatus ||
    "unknown";


  /*
   * ---------------------------------------------------------
   * RISK VALUES
   * ---------------------------------------------------------
   */

  const displayedRisk =
    Number(
      riskData?.risk_score ??
        riskData?.overall_risk_score ??
        riskData?.overallRiskScore
    );

  const fallbackRisk =
    Number(project?.risk) || 0;

  const finalRisk = Number.isFinite(displayedRisk)
    ? displayedRisk
    : fallbackRisk;

  const riskLevel =
    riskData?.risk_level ??
    riskData?.riskLevel ??
    (
      finalRisk >= 80
        ? "CRITICAL"
        : finalRisk >= 65
          ? "HIGH"
          : finalRisk >= 35
            ? "MEDIUM"
            : "LOW"
    );

  const ringRadius = 50;

  const ringCircumference =
    2 * Math.PI * ringRadius;

  const ringOffset =
    ringCircumference *
    (1 - Math.min(Math.max(finalRisk, 0), 100) / 100);


  /*
   * ---------------------------------------------------------
   * LOADING STATE
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <div>
        <Link
          to="/dashboard/projects"
          className="back-link"
        >
          <ArrowLeft size={15} />
          Back to Projects
        </Link>

        <div className="panel">
          <p>Loading project details...</p>
        </div>
      </div>
    );
  }


  /*
   * ---------------------------------------------------------
   * ERROR STATE
   * ---------------------------------------------------------
   */

  if (error) {
    return (
      <div>
        <Link
          to="/dashboard/projects"
          className="back-link"
        >
          <ArrowLeft size={15} />
          Back to Projects
        </Link>

        <div className="panel">
          <h2>Unable to load project</h2>

          <p
            style={{
              color: "#64748b",
              marginTop: 8,
            }}
          >
            {error}
          </p>
        </div>
      </div>
    );
  }


  /*
   * ---------------------------------------------------------
   * PROJECT NOT FOUND
   * ---------------------------------------------------------
   */

  if (!project) {
    return (
      <div>
        <Link
          to="/dashboard/projects"
          className="back-link"
        >
          <ArrowLeft size={15} />
          Back to Projects
        </Link>

        <div className="panel">
          <h2>Project not found</h2>

          <p
            style={{
              color: "#64748b",
              marginTop: 8,
            }}
          >
            No project was found for ID: {projectId}
          </p>
        </div>
      </div>
    );
  }


  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <div>

      {/* Back button */}

      <Link
        to="/dashboard/projects"
        className="back-link"
      >
        <ArrowLeft size={15} />
        Back to Projects
      </Link>


      {/* ---------------------------------------------------
          HEADER
      --------------------------------------------------- */}

      <div className="page-header">

        <div>

          <h1>{projectName}</h1>

          <p>
            <MapPin
              size={13}
              style={{
                display: "inline",
                marginRight: 4,
                verticalAlign: -2,
              }}
            />

            {location}
          </p>

        </div>


        <span
          className={`badge ${String(status)
            .toLowerCase()
            .replace(/\s+/g, "-")}`}
          style={{
            fontSize: 13,
            padding: "6px 14px",
          }}
        >
          {statusLabel(status)}
        </span>

      </div>


      {/* ---------------------------------------------------
          STAT CARDS
      --------------------------------------------------- */}

      <div
        className="stat-grid"
        style={{ marginBottom: 22 }}
      >

        {/* Target completion */}

        <div className="stat-card">

          <div className="stat-card-top">

            <div className="stat-icon blue">
              <Calendar size={18} />
            </div>

          </div>

          <div className="stat-value">
            {formatDate(deadline)}
          </div>

          <div className="stat-label">
            Target completion
          </div>

        </div>


        {/* Budget */}

        <div className="stat-card">

          <div className="stat-card-top">

            <div className="stat-icon green">
              <IndianRupee size={18} />
            </div>

          </div>

          <div className="stat-value">
            {formatCurrency(budget)}
          </div>

          <div className="stat-label">
            Total budget
          </div>

        </div>


        {/* Spent */}

        <div className="stat-card">

          <div className="stat-card-top">

            <div className="stat-icon amber">
              <IndianRupee size={18} />
            </div>

          </div>

          <div className="stat-value">
            {formatCurrency(spent)}
          </div>

          <div className="stat-label">
            Spent to date
          </div>

        </div>

      </div>


      {/* ---------------------------------------------------
          TABS
      --------------------------------------------------- */}

      <div className="tab-row">

        {[
          "overview",
          "predictions",
          "milestones",
        ].map((t) => (

          <button
            key={t}
            className={`tab-btn ${
              tab === t ? "active" : ""
            }`}
            onClick={() => setTab(t)}
          >
            {t === "overview"
              ? "Overview"
              : t === "predictions"
                ? "Risk Prediction"
                : "Milestones"}
          </button>

        ))}

      </div>


      {/* ===================================================
          OVERVIEW
      =================================================== */}

      {tab === "overview" && (

        <div className="dashboard-grid-2">

          {/* ------------------------------------------------
              PROGRESS
          ------------------------------------------------ */}

          <div className="panel">

            <div className="panel-header">

              <h2>Progress</h2>

            </div>


            <div
              style={{
                marginBottom: 8,
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13.5,
              }}
            >

              <span>
                Overall completion
              </span>

              <strong>
                {Math.round(progress)}%
              </strong>

            </div>


            <div
              className="progress-track"
              style={{
                height: 10,
                marginBottom: 20,
              }}
            >

              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(
                    Math.max(progress, 0),
                    100
                  )}%`,
                }}
              />

            </div>


            <p
              style={{
                fontSize: 13.5,
                color: "#64748b",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Project progress is based on the latest
              available project snapshot from the backend.
            </p>

          </div>


          {/* ------------------------------------------------
              M3 RISK SCORE
          ------------------------------------------------ */}

          <div
            className="panel"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >

            <div
              className="panel-header"
              style={{ width: "100%" }}
            >

              <h2>Risk Score</h2>

            </div>


            <div className="risk-gauge">

              <div className="risk-ring">

                <svg
                  viewBox="0 0 120 120"
                  width="120"
                  height="120"
                >

                  {/* Background ring */}

                  <circle
                    cx="60"
                    cy="60"
                    r={ringRadius}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="10"
                  />


                  {/* Risk ring */}

                  <circle
                    cx="60"
                    cy="60"
                    r={ringRadius}
                    fill="none"
                    stroke={riskColor(finalRisk)}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={
                      ringCircumference
                    }
                    strokeDashoffset={
                      ringOffset
                    }
                    transform="rotate(-90 60 60)"
                  />

                </svg>


                <div className="risk-ring-value">

                  <strong>
                    {riskLoading
                      ? "—"
                      : finalRisk.toFixed(1)}
                  </strong>

                  <span>
                    risk score
                  </span>

                </div>

              </div>


              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >

                Risk Level:{" "}

                <span
                  style={{
                    color: riskColor(finalRisk),
                  }}
                >
                  {riskLoading
                    ? "Loading..."
                    : riskLevel}
                </span>

              </div>


              <p
                style={{
                  fontSize: 12.5,
                  color: "#64748b",
                  textAlign: "center",
                  margin: 0,
                }}
              >

                {riskLevel === "CRITICAL"
                  ? "Critical risk — immediate intervention required"
                  : riskLevel === "HIGH"
                    ? "High risk — immediate attention recommended"
                    : riskLevel === "MEDIUM"
                      ? "Moderate risk — monitor closely"
                      : riskLevel === "LOW"
                        ? "Low risk — project is healthy"
                        : "Fetching AI risk assessment..."}

              </p>

            </div>


            {/* ------------------------------------------------
                M3 RISK COMPONENTS
            ------------------------------------------------ */}

            {riskData && (

              <div
                style={{
                  width: "100%",
                  marginTop: 18,
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr 1fr",
                  gap: 10,
                }}
              >

                {/* Cost Risk */}

                <div
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    background: "#f8fafc",
                    textAlign: "center",
                  }}
                >

                  <strong>
                    {Math.round(
                      Number(
                        riskData.cost_risk ?? 0
                      ) * 100
                    )}%
                  </strong>

                  <div
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                    }}
                  >
                    Cost Risk
                  </div>

                </div>


                {/* Delay Risk */}

                <div
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    background: "#f8fafc",
                    textAlign: "center",
                  }}
                >

                  <strong>
                    {Math.round(
                      Number(
                        riskData.delay_risk ?? 0
                      ) * 100
                    )}%
                  </strong>

                  <div
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                    }}
                  >
                    Delay Risk
                  </div>

                </div>


                {/* Anomaly */}

                <div
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    background: "#f8fafc",
                    textAlign: "center",
                  }}
                >

                  <strong>
                    {Math.round(
                      Number(
                        riskData.anomaly_adjustment ?? 0
                      ) * 100
                    )}%
                  </strong>

                  <div
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                    }}
                  >
                    Anomaly
                  </div>

                </div>

              </div>

            )}

          </div>

        </div>

      )}


      {/* ===================================================
          PREDICTIONS
      =================================================== */}

      {tab === "predictions" && (

        <div className="panel">

          <div className="panel-header">

            <h2>AI Risk Factors</h2>

            <span className="confidence-pill">

              {riskData?.model_confidence
                ? `${Math.round(
                    Number(
                      riskData.model_confidence
                    ) * 100
                  )}% model confidence`
                : "AI Risk Assessment"}

            </span>

          </div>


          {/* Dynamic M3 risk factors */}

          {riskData ? (

            <>

              <div>
                <div className="factor-row">

                  <span
                    style={{
                      minWidth: 200,
                    }}
                  >
                    Cost overrun likelihood
                  </span>

                  <div className="factor-track">

                    <div
                      className={`factor-fill ${
                        Number(
                          riskData.cost_risk
                        ) >= 0.6
                          ? "high"
                          : Number(
                              riskData.cost_risk
                            ) >= 0.3
                            ? "medium"
                            : "low"
                      }`}
                      style={{
                        width: `${
                          Number(
                            riskData.cost_risk ?? 0
                          ) * 100
                        }%`,
                      }}
                    />

                  </div>

                  <strong
                    style={{
                      fontSize: 13,
                      width: 34,
                      textAlign: "right",
                    }}
                  >
                    {Math.round(
                      Number(
                        riskData.cost_risk ?? 0
                      ) * 100
                    )}%
                  </strong>

                </div>
              </div>


              <div>
                <div className="factor-row">

                  <span
                    style={{
                      minWidth: 200,
                    }}
                  >
                    Schedule slippage risk
                  </span>

                  <div className="factor-track">

                    <div
                      className={`factor-fill ${
                        Number(
                          riskData.delay_risk
                        ) >= 0.6
                          ? "high"
                          : Number(
                              riskData.delay_risk
                            ) >= 0.3
                            ? "medium"
                            : "low"
                      }`}
                      style={{
                        width: `${
                          Number(
                            riskData.delay_risk ?? 0
                          ) * 100
                        }%`,
                      }}
                    />

                  </div>

                  <strong
                    style={{
                      fontSize: 13,
                      width: 34,
                      textAlign: "right",
                    }}
                  >
                    {Math.round(
                      Number(
                        riskData.delay_risk ?? 0
                      ) * 100
                    )}%
                  </strong>

                </div>
              </div>


              <div>
                <div className="factor-row">

                  <span
                    style={{
                      minWidth: 200,
                    }}
                  >
                    Expenditure / progress anomaly
                  </span>

                  <div className="factor-track">

                    <div
                      className={`factor-fill ${
                        Number(
                          riskData.anomaly_adjustment
                        ) >= 0.6
                          ? "high"
                          : Number(
                              riskData.anomaly_adjustment
                            ) >= 0.3
                            ? "medium"
                            : "low"
                      }`}
                      style={{
                        width: `${
                          Number(
                            riskData.anomaly_adjustment ??
                              0
                          ) * 100
                        }%`,
                      }}
                    />

                  </div>

                  <strong
                    style={{
                      fontSize: 13,
                      width: 34,
                      textAlign: "right",
                    }}
                  >
                    {Math.round(
                      Number(
                        riskData.anomaly_adjustment ??
                          0
                      ) * 100
                    )}%
                  </strong>

                </div>
              </div>

            </>

          ) : (

            <p
              style={{
                color: "#64748b",
                fontSize: 13.5,
              }}
            >
              Risk prediction data is currently
              unavailable.
            </p>

          )}

        </div>

      )}


      {/* ===================================================
          MILESTONES / SNAPSHOT HISTORY
      =================================================== */}

      {tab === "milestones" && (

        <div className="panel">

          <div className="panel-header">

            <h2>Project Snapshot History</h2>

          </div>


          {snapshots.length === 0 ? (

            <p
              style={{
                color: "#64748b",
                fontSize: 13.5,
              }}
            >
              No project snapshots are available yet.
            </p>

          ) : (

            <div
              style={{
                overflowX: "auto",
              }}
            >

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >

                <thead>

                  <tr>

                    <th
                      style={{
                        textAlign: "left",
                        padding: 10,
                        borderBottom:
                          "1px solid #e2e8f0",
                      }}
                    >
                      Date
                    </th>

                    <th
                      style={{
                        textAlign: "left",
                        padding: 10,
                        borderBottom:
                          "1px solid #e2e8f0",
                      }}
                    >
                      Physical Progress
                    </th>

                    <th
                      style={{
                        textAlign: "left",
                        padding: 10,
                        borderBottom:
                          "1px solid #e2e8f0",
                      }}
                    >
                      Expenditure
                    </th>

                    <th
                      style={{
                        textAlign: "left",
                        padding: 10,
                        borderBottom:
                          "1px solid #e2e8f0",
                      }}
                    >
                      Status
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {snapshots.map(
                    (snapshot, index) => {

                      const snapshotProgress =
                        getProgress(
                          project,
                          snapshot
                        );

                      const snapshotSpent =
                        getSpent(
                          project,
                          snapshot
                        );

                      const snapshotDate =
                        snapshot?.date ??
                        snapshot?.snapshot_date ??
                        snapshot?.snapshotDate ??
                        snapshot?.created_at ??
                        snapshot?.createdAt;

                      return (

                        <tr
                          key={
                            snapshot?._id ||
                            snapshot?.id ||
                            index
                          }
                        >

                          <td
                            style={{
                              padding: 10,
                              borderBottom:
                                "1px solid #f1f5f9",
                            }}
                          >
                            {formatDate(
                              snapshotDate
                            )}
                          </td>

                          <td
                            style={{
                              padding: 10,
                              borderBottom:
                                "1px solid #f1f5f9",
                            }}
                          >
                            {Math.round(
                              snapshotProgress
                            )}%
                          </td>

                          <td
                            style={{
                              padding: 10,
                              borderBottom:
                                "1px solid #f1f5f9",
                            }}
                          >
                            {formatCurrency(
                              snapshotSpent
                            )}
                          </td>

                          <td
                            style={{
                              padding: 10,
                              borderBottom:
                                "1px solid #f1f5f9",
                            }}
                          >
                            Snapshot
                          </td>

                        </tr>

                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      )}

    </div>
  );
}


export default ProjectDetails;