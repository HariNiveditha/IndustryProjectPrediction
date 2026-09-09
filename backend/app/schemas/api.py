from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ProjectResponse(BaseModel):
    project_id: str
    project_name: str | None = None
    project_name_normalized: str | None = None
    project_code: str | None = None
    format: str | None = None


class ProjectListResponse(BaseModel):
    items: list[ProjectResponse]
    limit: int
    skip: int


class SnapshotResponse(BaseModel):
    model_config = ConfigDict(extra="allow")

    project_id: str
    snapshot_date: str


class SnapshotListResponse(BaseModel):
    items: list[SnapshotResponse]
    limit: int
    skip: int


class PredictionTargetResponse(BaseModel):
    prediction: int
    probability: float = Field(ge=0, le=1)


class PredictionResponse(BaseModel):
    project_id: str
    snapshot_date: str
    cost_overrun_target: PredictionTargetResponse
    time_overrun_target: PredictionTargetResponse
    anomaly: dict[str, Any]
    risk: dict[str, Any]
    early_warnings: dict[str, Any]


class ExplanationResponse(BaseModel):
    project_id: str
    snapshot_date: str
    cost_overrun_target: dict[str, Any]
    time_overrun_target: dict[str, Any]


class AlertResponse(BaseModel):
    project_id: str
    snapshot_date: str
    early_warnings: dict[str, Any]
    risk: dict[str, Any]
    anomaly: dict[str, Any]
    model_probabilities: dict[str, float]


class DashboardSummaryResponse(BaseModel):
    total_projects: int
    total_snapshots: int
    projects_with_latest_anomaly: int
    risk_distribution: dict[str, int] | None = None
    latest_snapshot_date: str | None = None
    risk_distribution_note: str


class AnalyticsSummaryResponse(BaseModel):
    total_projects: int
    total_snapshots: int
    unique_snapshot_dates: int
    first_snapshot_date: str | None = None
    latest_snapshot_date: str | None = None
    average_physical_progress_pct: float | None = None
    total_original_cost_cr: float | None = None
    total_revised_cost_cr: float | None = None
    total_cumulative_expenditure_cr: float | None = None