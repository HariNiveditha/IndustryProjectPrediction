from fastapi import APIRouter
from services.risk_service import (
    calculate_risk_score,
    get_risk_level,
    calculate_anomaly_adjustment,
)

router = APIRouter(prefix="/projects", tags=["Risk"])


# Temporary demo data.
# Backend/database integration can replace this later.
DEMO_PROJECTS = {
    101: {
        "project_id": 101,
        "cost_risk": 0.82,
        "delay_risk": 0.74,
        "physical_progress_pct": 40,
        "cumulative_expenditure_cr": 60,
        "original_cost_cr": 100,
    }
}


@router.get("/{project_id}/risk")
def get_project_risk(project_id: int):

    project = DEMO_PROJECTS.get(project_id)

    if project is None:
        return {
            "error": "Project not found",
            "project_id": project_id
        }

    anomaly = calculate_anomaly_adjustment(
        project["physical_progress_pct"],
        project["cumulative_expenditure_cr"],
        project["original_cost_cr"]
    )

    risk_score = calculate_risk_score(
        project["cost_risk"],
        project["delay_risk"],
        anomaly
    )

    risk_level = get_risk_level(risk_score)

    return {
        "project_id": project_id,
        "cost_risk": project["cost_risk"],
        "delay_risk": project["delay_risk"],
        "anomaly_adjustment": anomaly,
        "risk_score": risk_score,
        "risk_level": risk_level
    }