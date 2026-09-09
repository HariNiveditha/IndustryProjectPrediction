from fastapi import APIRouter, HTTPException

from app.api.pipeline import ProjectAnalysisNotFound, analyze_project
from app.schemas.api import AlertResponse
from app.services.project_data_service import ProjectDataAccessError
from app.services.persistence_service import PersistenceError


router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/{project_id}", response_model=AlertResponse)
def project_alerts(project_id: str):
    try:
        analysis = analyze_project(project_id, persist=True)
    except ProjectAnalysisNotFound as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ProjectDataAccessError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except PersistenceError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error

    return {
        "project_id": project_id,
        "snapshot_date": analysis["snapshot"]["snapshot_date"],
        "early_warnings": analysis["early_warnings"],
        "risk": analysis["risk"],
        "anomaly": analysis["anomaly"],
        "model_probabilities": analysis["early_warnings"]["model_probabilities"],
    }