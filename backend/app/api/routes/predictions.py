from fastapi import APIRouter, HTTPException

from app.api.pipeline import ProjectAnalysisNotFound, analyze_project
from app.schemas.api import ExplanationResponse, PredictionResponse
from app.services.project_data_service import ProjectDataAccessError
from app.services.persistence_service import (
    PersistenceError,
    get_explanation_record,
    upsert_explanation_record,
)
from app.services.shap_service import explain_snapshot


router = APIRouter(prefix="/predictions", tags=["predictions"])


def _analysis_or_http_error(project_id: str):
    try:
        return analyze_project(project_id, persist=True)
    except ProjectAnalysisNotFound as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ProjectDataAccessError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except PersistenceError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error


@router.get("/{project_id}", response_model=PredictionResponse)
def project_prediction(project_id: str):
    analysis = _analysis_or_http_error(project_id)
    return {
        "project_id": project_id,
        "snapshot_date": analysis["snapshot"]["snapshot_date"],
        "cost_overrun_target": analysis["predictions"]["cost_overrun_target"],
        "time_overrun_target": analysis["predictions"]["time_overrun_target"],
        "anomaly": analysis["anomaly"],
        "risk": analysis["risk"],
        "early_warnings": analysis["early_warnings"],
    }


@router.get("/{project_id}/explanations", response_model=ExplanationResponse)
def project_explanations(project_id: str):
    analysis = _analysis_or_http_error(project_id)
    snapshot_date = analysis["snapshot"]["snapshot_date"]
    try:
        stored = get_explanation_record(project_id, snapshot_date)
    except PersistenceError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    if stored is not None:
        explanations = {
            "cost_overrun_target": stored["cost_overrun_target"],
            "time_overrun_target": stored["time_overrun_target"],
        }
    else:
        try:
            explanations = explain_snapshot(analysis["snapshot"])
            upsert_explanation_record(
                project_id,
                snapshot_date,
                explanations,
            )
        except ValueError as error:
            raise HTTPException(status_code=422, detail=str(error)) from error
        except PersistenceError as error:
            raise HTTPException(status_code=503, detail=str(error)) from error
    return {
        "project_id": project_id,
        "snapshot_date": analysis["snapshot"]["snapshot_date"],
        **explanations,
    }