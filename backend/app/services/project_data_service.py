from __future__ import annotations

from collections.abc import Mapping
from datetime import date, datetime
from typing import Any

from bson import ObjectId
from pymongo.errors import PyMongoError

from app.core.database import database


PROJECTS_COLLECTION = "projects"
SNAPSHOTS_COLLECTION = "snapshots"


class ProjectDataAccessError(RuntimeError):
    """Raised when MongoDB project or snapshot retrieval fails."""


def _serialize_value(value: Any) -> Any:
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, Mapping):
        return {key: _serialize_value(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_serialize_value(item) for item in value]
    return value


def _serialize_document(document: Mapping[str, Any] | None) -> dict[str, Any] | None:
    if document is None:
        return None
    return _serialize_value(document)


def _validate_pagination(limit: int, skip: int) -> None:
    if limit < 1:
        raise ValueError("limit must be greater than zero")
    if skip < 0:
        raise ValueError("skip must not be negative")


def _project_query(project_id: str) -> dict[str, Any]:
    query: dict[str, Any] = {"project_id": project_id}
    if ObjectId.is_valid(project_id):
        query = {
            "$or": [
                {"_id": ObjectId(project_id)},
                {"project_id": project_id},
            ]
        }
    return query


def list_projects(limit: int = 100, skip: int = 0) -> list[dict[str, Any]]:
    """Return stored project documents without modifying MongoDB."""
    _validate_pagination(limit, skip)
    try:
        documents = (
            database[PROJECTS_COLLECTION]
            .find({})
            .skip(skip)
            .limit(limit)
        )
        return [_serialize_document(document) for document in documents]
    except PyMongoError as error:
        raise ProjectDataAccessError("Could not retrieve projects from MongoDB.") from error


def get_project(project_id: str) -> dict[str, Any] | None:
    """Return one project by its Mongo ObjectId or project_id, if present."""
    try:
        document = database[PROJECTS_COLLECTION].find_one(_project_query(project_id))
        return _serialize_document(document)
    except PyMongoError as error:
        raise ProjectDataAccessError("Could not retrieve the project from MongoDB.") from error


def get_latest_snapshot(project_id: str) -> dict[str, Any] | None:
    """Return the newest snapshot for a project by snapshot_date."""
    try:
        document = (
            database[SNAPSHOTS_COLLECTION]
            .find_one(
                {"project_id": project_id},
                sort=[("snapshot_date", -1), ("_id", -1)],
            )
        )
        return _serialize_document(document)
    except PyMongoError as error:
        raise ProjectDataAccessError(
            "Could not retrieve the latest project snapshot from MongoDB."
        ) from error


def get_project_snapshots(
    project_id: str,
    limit: int = 100,
    skip: int = 0,
) -> list[dict[str, Any]]:
    """Return a project's snapshots in chronological snapshot_date order."""
    _validate_pagination(limit, skip)
    try:
        documents = (
            database[SNAPSHOTS_COLLECTION]
            .find({"project_id": project_id})
            .sort([("snapshot_date", 1), ("_id", 1)])
            .skip(skip)
            .limit(limit)
        )
        return [_serialize_document(document) for document in documents]
    except PyMongoError as error:
        raise ProjectDataAccessError(
            "Could not retrieve project snapshots from MongoDB."
        ) from error