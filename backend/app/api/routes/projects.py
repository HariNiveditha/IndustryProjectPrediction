from fastapi import APIRouter, HTTPException, Query

from app.schemas.api import ProjectListResponse, ProjectResponse, SnapshotListResponse, SnapshotResponse
from app.services.project_data_service import (
    ProjectDataAccessError,
    get_project,
    get_project_snapshots,
    list_projects,
)


router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=ProjectListResponse)
def projects(
    limit: int = Query(default=100, ge=1, le=500),
    skip: int = Query(default=0, ge=0),
):
    try:
        items = list_projects(limit=limit, skip=skip)
    except ProjectDataAccessError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    return {"items": items, "limit": limit, "skip": skip}


@router.get("/{project_id}", response_model=ProjectResponse)
def project(project_id: str):
    if not project_id.strip():
        raise HTTPException(status_code=422, detail="project_id must not be empty")
    try:
        item = get_project(project_id)
    except ProjectDataAccessError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    if item is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return item


@router.get("/{project_id}/snapshots", response_model=SnapshotListResponse)
def project_snapshots(
    project_id: str,
    limit: int = Query(default=100, ge=1, le=500),
    skip: int = Query(default=0, ge=0),
):
    if not project_id.strip():
        raise HTTPException(status_code=422, detail="project_id must not be empty")
    try:
        if get_project(project_id) is None:
            raise HTTPException(status_code=404, detail="Project not found")
        items = get_project_snapshots(project_id, limit=limit, skip=skip)
    except ProjectDataAccessError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    return {"items": items, "limit": limit, "skip": skip}