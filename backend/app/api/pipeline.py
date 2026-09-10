from __future__ import annotations

from typing import Any

from app.services.anomaly_service import detect_anomalies
from app.services.early_warning_service import evaluate_early_warnings
from app.services.prediction_service import predict
from app.services.persistence_service import (
    PersistenceError,
    get_prediction_record,
    upsert_prediction_record,
    upsert_warning_alerts,
)
from app.services.project_data_service import get_latest_snapshot, get_project
from app.services.risk_service import calculate_risk


class ProjectAnalysisNotFound(LookupError):
    def __init__(self, project_id: str, missing: str):
        super().__init__(f"Project '{project_id}' has no {missing}.")
        self.project_id = project_id
        self.missing = missing


def analyze_project(project_id: str, persist: bool = False) -> dict[str, Any]:
    project = get_project(project_id)
    if project is None:
        raise ProjectAnalysisNotFound(project_id, "project")

    snapshot = get_latest_snapshot(project_id)
    if snapshot is None:
        raise ProjectAnalysisNotFound(project_id, "snapshot")

    snapshot_date = snapshot["snapshot_date"]
    if persist:
        stored = get_prediction_record(project_id, snapshot_date)
        if stored is not None:
            analysis = {
                "project": project,
                "snapshot": snapshot,
                "predictions": stored["predictions"],
                "anomaly": stored["anomaly"],
                "risk": stored["risk"],
                "early_warnings": stored["early_warnings"],
            }
            upsert_warning_alerts(
                project_id,
                snapshot_date,
                analysis["early_warnings"],
                analysis["risk"],
                analysis["anomaly"],
                analysis["early_warnings"]["model_probabilities"],
            )
            return analysis

    predictions = predict(snapshot)
    anomalies = detect_anomalies(snapshot)
    risk = calculate_risk(
        predictions["cost_overrun_target"]["probability"],
        predictions["time_overrun_target"]["probability"],
        anomalies["anomaly_penalty"],
    )
    early_warnings = evaluate_early_warnings(predictions, anomalies, risk)
    analysis = {
        "project": project,
        "snapshot": snapshot,
        "predictions": predictions,
        "anomaly": anomalies,
        "risk": risk,
        "early_warnings": early_warnings,
    }
    if persist:
        upsert_prediction_record(
            project_id,
            snapshot_date,
            predictions,
            anomalies,
            risk,
            early_warnings,
        )
        upsert_warning_alerts(
            project_id,
            snapshot_date,
            early_warnings,
            risk,
            anomalies,
            early_warnings["model_probabilities"],
        )
    return analysis