from fastapi import APIRouter
from services.rule_service import (
    generate_alerts,
    generate_early_warning,
)

router = APIRouter(prefix="/projects", tags=["Alerts"])


# Temporary demo project.
# Backend/database integration can replace this later.
DEMO_PROJECTS = {
    101: {
        "project_id": 101,
        "original_cost_cr": 100,
        "cumulative_expenditure_cr": 60,
        "physical_progress_pct": 40,
        "prev_progress": 39.5,
        "prev_expenditure": 55,
        "months_since_prev_snapshot": 3,
        "planned_duration_days": 1000,
        "elapsed_duration_days": 850
    }
}


@router.get("/{project_id}/alerts")
def get_project_alerts(project_id: int):

    project = DEMO_PROJECTS.get(project_id)

    if project is None:
        return {
            "project_id": project_id,
            "alerts": [],
            "error": "Project not found"
        }

    alerts = generate_alerts(project)

    early_warning = generate_early_warning(project)

    return {
        "project_id": project_id,
        "alerts": alerts,
        "early_warning": early_warning
    }