from fastapi import APIRouter

from app.core.database import database
from app.schemas.api import AnalyticsSummaryResponse


router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummaryResponse)
def analytics_summary():
    snapshots = database["snapshots"]
    stats = next(
        iter(
            snapshots.aggregate(
                [
                    {
                        "$group": {
                            "_id": None,
                            "average_physical_progress_pct": {"$avg": "$physical_progress_pct"},
                            "total_original_cost_cr": {"$sum": "$original_cost_cr"},
                            "total_revised_cost_cr": {"$sum": "$revised_cost_cr"},
                            "total_cumulative_expenditure_cr": {"$sum": "$cumulative_expenditure_cr"},
                            "first_snapshot_date": {"$min": "$snapshot_date"},
                            "latest_snapshot_date": {"$max": "$snapshot_date"},
                        }
                    }
                ]
            )
        ),
        {},
    )
    def iso(value):
        return value.isoformat() if value else None

    return {
        "total_projects": database["projects"].count_documents({}),
        "total_snapshots": snapshots.count_documents({}),
        "unique_snapshot_dates": len(snapshots.distinct("snapshot_date")),
        "first_snapshot_date": iso(stats.get("first_snapshot_date")),
        "latest_snapshot_date": iso(stats.get("latest_snapshot_date")),
        "average_physical_progress_pct": stats.get("average_physical_progress_pct"),
        "total_original_cost_cr": stats.get("total_original_cost_cr"),
        "total_revised_cost_cr": stats.get("total_revised_cost_cr"),
        "total_cumulative_expenditure_cr": stats.get("total_cumulative_expenditure_cr"),
    }