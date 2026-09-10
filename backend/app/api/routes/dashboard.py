from fastapi import APIRouter

from app.core.database import database
from app.schemas.api import DashboardSummaryResponse


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummaryResponse)
def dashboard_summary():
    snapshots = database["snapshots"]
    latest_by_project = snapshots.aggregate(
        [
            {"$group": {"_id": "$project_id", "latest_snapshot_date": {"$max": "$snapshot_date"}}},
            {
                "$lookup": {
                    "from": "snapshots",
                    "let": {"project_id": "$_id", "snapshot_date": "$latest_snapshot_date"},
                    "pipeline": [
                        {"$match": {"$expr": {"$and": [
                            {"$eq": ["$project_id", "$$project_id"]},
                            {"$eq": ["$snapshot_date", "$$snapshot_date"]},
                        ]}}},
                        {"$limit": 1},
                    ],
                    "as": "latest_snapshot",
                }
            },
            {"$unwind": "$latest_snapshot"},
            {
                "$project": {
                    "has_anomaly": {
                        "$or": [
                            {"$eq": ["$latest_snapshot.progress_invalid_flag", True]},
                            {"$eq": ["$latest_snapshot.expenditure_invalid_flag", True]},
                            {"$eq": ["$latest_snapshot.expenditure_above_original_flag", True]},
                            {"$eq": ["$latest_snapshot.expenditure_above_revised_flag", True]},
                            {"$eq": ["$latest_snapshot.approval_date_invalid_flag", True]},
                            {"$eq": ["$latest_snapshot.revised_start_date_invalid_flag", True]},
                            {"$eq": ["$latest_snapshot.target_doc_invalid_flag", True]},
                            {"$eq": ["$latest_snapshot.revised_doc_invalid_flag", True]},
                        ]
                    }
                }
            },
            {"$group": {"_id": None, "projects_with_latest_anomaly": {"$sum": {"$cond": ["$has_anomaly", 1, 0]}}}},
        ]
    )
    anomaly_summary = next(iter(latest_by_project), {"projects_with_latest_anomaly": 0})
    latest = snapshots.find_one({}, {"snapshot_date": 1}, sort=[("snapshot_date", -1)])
    latest_date = latest.get("snapshot_date").isoformat() if latest and latest.get("snapshot_date") else None
    return {
        "total_projects": database["projects"].count_documents({}),
        "total_snapshots": snapshots.count_documents({}),
        "projects_with_latest_anomaly": int(anomaly_summary.get("projects_with_latest_anomaly", 0)),
        "risk_distribution": None,
        "latest_snapshot_date": latest_date,
        "risk_distribution_note": "Risk distribution is not persisted; computing it requires per-project model inference.",
    }