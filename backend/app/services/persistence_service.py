from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from pymongo import UpdateOne
from pymongo.database import Database
from pymongo.errors import PyMongoError

from app.core.database import database


PREDICTIONS_COLLECTION = "predictions"
EXPLANATIONS_COLLECTION = "explanations"
ALERTS_COLLECTION = "alerts"


class PersistenceError(RuntimeError):
    """Raised when a computed result cannot be persisted or read."""


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _key(project_id: str, snapshot_date: str) -> dict[str, str]:
    return {"project_id": project_id, "snapshot_date": snapshot_date}


def _ensure_index(collection, keys, unique: bool, name: str) -> None:
    for index in collection.index_information().values():
        if list(index.get("key", [])) == keys and bool(index.get("unique", False)) == unique:
            return
    collection.create_index(keys, unique=unique, name=name)


def ensure_persistence_indexes(target_database: Database = database) -> None:
    try:
        _ensure_index(
            target_database[PREDICTIONS_COLLECTION],
            [("project_id", 1), ("snapshot_date", 1)],
            True,
            "prediction_project_snapshot_unique",
        )
        _ensure_index(
            target_database[EXPLANATIONS_COLLECTION],
            [("project_id", 1), ("snapshot_date", 1)],
            True,
            "explanation_project_snapshot_unique",
        )
        _ensure_index(
            target_database[ALERTS_COLLECTION],
            [("project_id", 1), ("snapshot_date", 1), ("alert_type", 1)],
            True,
            "alert_project_snapshot_type_unique",
        )
    except PyMongoError as error:
        raise PersistenceError("Could not prepare result persistence indexes.") from error


def get_prediction_record(
    project_id: str,
    snapshot_date: str,
    target_database: Database = database,
) -> dict[str, Any] | None:
    try:
        return target_database[PREDICTIONS_COLLECTION].find_one(
            _key(project_id, snapshot_date), {"_id": 0}
        )
    except PyMongoError as error:
        raise PersistenceError("Could not read the stored prediction result.") from error


def upsert_prediction_record(
    project_id: str,
    snapshot_date: str,
    predictions: dict[str, Any],
    anomaly: dict[str, Any],
    risk: dict[str, Any],
    early_warnings: dict[str, Any],
    target_database: Database = database,
) -> None:
    ensure_persistence_indexes(target_database)
    now = _now()
    document = {
        **_key(project_id, snapshot_date),
        "predictions": predictions,
        "anomaly": anomaly,
        "risk": risk,
        "early_warnings": early_warnings,
        "updated_at": now,
    }
    try:
        target_database[PREDICTIONS_COLLECTION].update_one(
            _key(project_id, snapshot_date),
            {"$set": document, "$setOnInsert": {"created_at": now}},
            upsert=True,
        )
    except PyMongoError as error:
        raise PersistenceError("Could not store the prediction result.") from error


def get_explanation_record(
    project_id: str,
    snapshot_date: str,
    target_database: Database = database,
) -> dict[str, Any] | None:
    try:
        return target_database[EXPLANATIONS_COLLECTION].find_one(
            _key(project_id, snapshot_date), {"_id": 0}
        )
    except PyMongoError as error:
        raise PersistenceError("Could not read the stored explanation.") from error


def upsert_explanation_record(
    project_id: str,
    snapshot_date: str,
    explanation: dict[str, Any],
    target_database: Database = database,
) -> None:
    ensure_persistence_indexes(target_database)
    now = _now()
    document = {**_key(project_id, snapshot_date), **explanation, "updated_at": now}
    try:
        target_database[EXPLANATIONS_COLLECTION].update_one(
            _key(project_id, snapshot_date),
            {"$set": document, "$setOnInsert": {"created_at": now}},
            upsert=True,
        )
    except PyMongoError as error:
        raise PersistenceError("Could not store the explanation.") from error


def upsert_warning_alerts(
    project_id: str,
    snapshot_date: str,
    early_warnings: dict[str, Any],
    risk: dict[str, Any],
    anomaly: dict[str, Any],
    model_probabilities: dict[str, float],
    target_database: Database = database,
) -> int:
    warnings = early_warnings.get("warnings", [])
    if not early_warnings.get("warning_exists") or not warnings:
        return 0

    ensure_persistence_indexes(target_database)
    now = _now()
    operations = []
    for warning in warnings:
        alert_type = warning.get("type")
        if not alert_type:
            continue
        key = {**_key(project_id, snapshot_date), "alert_type": alert_type}
        document = {
            **key,
            "warning": warning,
            "risk": risk,
            "anomaly": anomaly,
            "model_probabilities": model_probabilities,
            "updated_at": now,
        }
        operations.append(UpdateOne(key, {"$set": document, "$setOnInsert": {"created_at": now}}, upsert=True))

    if not operations:
        return 0
    try:
        target_database[ALERTS_COLLECTION].bulk_write(operations, ordered=False)
    except PyMongoError as error:
        raise PersistenceError("Could not store early-warning alerts.") from error
    return len(operations)