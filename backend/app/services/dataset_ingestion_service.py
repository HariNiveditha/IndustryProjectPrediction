from __future__ import annotations

import os
from collections import Counter
from datetime import date, datetime
from io import BytesIO
from pathlib import Path
from typing import Any
from zipfile import ZipFile

import joblib
import numpy as np
import pandas as pd
from pymongo import UpdateOne
from pymongo.collection import Collection
from pymongo.database import Database
from pymongo.errors import PyMongoError

from app.core.database import database


PROJECTS_COLLECTION = "projects"
SNAPSHOTS_COLLECTION = "snapshots"
PROJECT_METADATA_FIELDS = (
    "project_id",
    "project_name",
    "project_name_normalized",
    "project_code",
    "format",
)
DATE_FIELDS = (
    "approval_date",
    "revised_start_date",
    "target_doc",
    "revised_doc",
    "snapshot_date",
    "planned_end_date",
)
EXPECTED_ROWS = 23_115
EXPECTED_PROJECTS = 9_664
EXPECTED_SNAPSHOT_DATES = 16
DEFAULT_BATCH_SIZE = 500

PROJECT_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_DATASET_PATH = PROJECT_ROOT.parent / "PAIMANA_feature_engineered_dataset.csv"
MODEL_PACKAGE_PATH = PROJECT_ROOT / "M2_model_package.zip"


class DatasetValidationError(ValueError):
    """Raised when the source dataset does not match the verified contract."""


class IngestionBatchError(RuntimeError):
    """Raised with enough context to resume after a failed write batch."""


def dataset_path() -> Path:
    configured_path = os.getenv("PAIMANA_DATASET_PATH")
    return Path(configured_path) if configured_path else DEFAULT_DATASET_PATH


def ingestion_batch_size() -> int:
    configured_size = os.getenv("PAIMANA_INGEST_BATCH_SIZE")
    if not configured_size:
        return DEFAULT_BATCH_SIZE
    try:
        batch_size = int(configured_size)
    except ValueError as error:
        raise ValueError("PAIMANA_INGEST_BATCH_SIZE must be a positive integer.") from error
    if batch_size < 1:
        raise ValueError("PAIMANA_INGEST_BATCH_SIZE must be a positive integer.")
    return batch_size


def load_model_features(package_path: Path = MODEL_PACKAGE_PATH) -> tuple[tuple[str, ...], tuple[str, ...]]:
    if not package_path.is_file():
        raise FileNotFoundError(f"M2 model package was not found at {package_path}.")

    with ZipFile(package_path) as package:
        try:
            cost_features = tuple(joblib.load(BytesIO(package.read("cost_features.pkl"))))
            time_features = tuple(joblib.load(BytesIO(package.read("time_features.pkl"))))
        except KeyError as error:
            raise DatasetValidationError(
                "The M2 model package is missing a feature-list artifact."
            ) from error
    return cost_features, time_features


def _required_features(package_path: Path = MODEL_PACKAGE_PATH) -> tuple[str, ...]:
    cost_features, time_features = load_model_features(package_path)
    return tuple(dict.fromkeys((*cost_features, *time_features)))


def load_source_dataframe(source_path: Path | None = None) -> pd.DataFrame:
    path = source_path or dataset_path()
    if not path.is_file():
        raise FileNotFoundError(f"PAIMANA dataset was not found at {path}.")
    return pd.read_csv(path, low_memory=False)


def _parse_dates(dataframe: pd.DataFrame) -> pd.DataFrame:
    parsed = dataframe.copy()
    for field in DATE_FIELDS:
        if field in parsed.columns:
            parsed[field] = pd.to_datetime(parsed[field], errors="coerce")
    return parsed


def validate_source_dataframe(
    dataframe: pd.DataFrame,
    package_path: Path = MODEL_PACKAGE_PATH,
    enforce_expected_counts: bool = True,
) -> dict[str, Any]:
    required_features = _required_features(package_path)
    missing_columns = [field for field in required_features if field not in dataframe.columns]
    if missing_columns:
        raise DatasetValidationError(
            "Required M2 feature columns are missing: " + ", ".join(missing_columns)
        )

    if "project_id" not in dataframe.columns or "snapshot_date" not in dataframe.columns:
        raise DatasetValidationError("The source must contain project_id and snapshot_date columns.")

    parsed = _parse_dates(dataframe)
    missing_project_ids = int(parsed["project_id"].isna().sum())
    missing_snapshot_dates = int(parsed["snapshot_date"].isna().sum())
    blank_project_ids = int(parsed["project_id"].astype("string").str.strip().eq("").sum())
    duplicate_rows = int(parsed.duplicated(["project_id", "snapshot_date"]).sum())
    if missing_project_ids or blank_project_ids:
        raise DatasetValidationError("The source contains missing or blank project_id values.")
    if missing_snapshot_dates:
        raise DatasetValidationError("The source contains missing or invalid snapshot_date values.")
    if duplicate_rows:
        raise DatasetValidationError(
            f"The source contains {duplicate_rows} duplicate (project_id, snapshot_date) rows."
        )

    row_count = len(parsed)
    project_count = int(parsed["project_id"].nunique())
    snapshot_date_count = int(parsed["snapshot_date"].nunique())
    if enforce_expected_counts:
        expected = {
            "rows": (row_count, EXPECTED_ROWS),
            "projects": (project_count, EXPECTED_PROJECTS),
            "snapshot_dates": (snapshot_date_count, EXPECTED_SNAPSHOT_DATES),
        }
        mismatches = [f"{name}={actual} (expected {expected_value})" for name, (actual, expected_value) in expected.items() if actual != expected_value]
        if mismatches:
            raise DatasetValidationError("Unexpected source counts: " + ", ".join(mismatches))

    null_statistics = {
        field: int(parsed[field].isna().sum())
        for field in required_features
        if int(parsed[field].isna().sum())
    }
    return {
        "rows": row_count,
        "projects": project_count,
        "snapshot_dates": snapshot_date_count,
        "duplicate_rows": duplicate_rows,
        "missing_project_ids": missing_project_ids + blank_project_ids,
        "missing_snapshot_dates": missing_snapshot_dates,
        "feature_nulls": null_statistics,
        "required_features": list(required_features),
    }


def _bson_value(value: Any) -> Any:
    if value is None or value is pd.NA or value is pd.NaT:
        return None
    if isinstance(value, np.datetime64) and np.isnat(value):
        return None
    if isinstance(value, (float, np.floating)) and np.isnan(value):
        return None
    if isinstance(value, (pd.Timestamp, datetime)):
        return value.to_pydatetime() if isinstance(value, pd.Timestamp) else value
    if isinstance(value, date):
        return datetime.combine(value, datetime.min.time())
    if isinstance(value, np.generic):
        return value.item()
    if isinstance(value, dict):
        return {key: _bson_value(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_bson_value(item) for item in value]
    return value


def _row_document(row: pd.Series) -> dict[str, Any]:
    return {field: _bson_value(value) for field, value in row.to_dict().items()}


def extract_project_documents(dataframe: pd.DataFrame) -> list[dict[str, Any]]:
    documents = []
    for project_id, group in dataframe.groupby("project_id", sort=False, dropna=False):
        document = {"project_id": _bson_value(project_id)}
        for field in PROJECT_METADATA_FIELDS[1:]:
            values = group[field].dropna()
            document[field] = _bson_value(values.iloc[0] if not values.empty else None)
        documents.append(document)
    return documents


def extract_snapshot_documents(dataframe: pd.DataFrame) -> list[dict[str, Any]]:
    return [_row_document(row) for _, row in dataframe.iterrows()]


def _bulk_upsert(
    collection: Collection,
    documents: list[dict[str, Any]],
    key_fields: tuple[str, ...],
    batch_size: int = DEFAULT_BATCH_SIZE,
    collection_name: str = "collection",
) -> dict[str, int]:
    if batch_size < 1:
        raise ValueError("batch_size must be a positive integer")
    totals = Counter()
    for start in range(0, len(documents), batch_size):
        batch = documents[start : start + batch_size]
        batch_number = start // batch_size + 1
        operations = [
            UpdateOne(
                {field: document[field] for field in key_fields},
                {"$set": document},
                upsert=True,
            )
            for document in batch
        ]
        try:
            result = collection.bulk_write(operations, ordered=False)
        except PyMongoError as error:
            end = start + len(batch) - 1
            raise IngestionBatchError(
                f"MongoDB write failed for {collection_name} batch {batch_number} "
                f"(rows {start}-{end}, {len(batch)} operations). "
                "Completed earlier batches remain valid; rerun to resume."
            ) from error
        totals["upserted"] += int(getattr(result, "upserted_count", 0))
        totals["matched"] += int(getattr(result, "matched_count", 0))
        totals["modified"] += int(getattr(result, "modified_count", 0))
    return dict(totals)


def _ensure_indexes(target_database: Database) -> list[str]:
    projects = target_database[PROJECTS_COLLECTION]
    snapshots = target_database[SNAPSHOTS_COLLECTION]
    requested = (
        (projects, [("project_id", 1)], True, "projects.project_id (unique)"),
        (
            snapshots,
            [("project_id", 1), ("snapshot_date", 1)],
            True,
            "snapshots.project_id + snapshot_date (unique)",
        ),
        (snapshots, [("project_id", 1)], False, "snapshots.project_id"),
        (snapshots, [("snapshot_date", 1)], False, "snapshots.snapshot_date"),
    )
    created = []
    for collection, keys, unique, description in requested:
        existing = collection.index_information().values()
        if any(
            list(index.get("key", [])) == keys
            and bool(index.get("unique", False)) == unique
            for index in existing
        ):
            continue
        collection.create_index(keys, unique=unique)
        created.append(description)
    return created


def ingest_dataframe(
    dataframe: pd.DataFrame,
    target_database: Database = database,
    dry_run: bool = False,
    package_path: Path = MODEL_PACKAGE_PATH,
    batch_size: int | None = None,
) -> dict[str, Any]:
    parsed = _parse_dates(dataframe)
    validation = validate_source_dataframe(parsed, package_path)
    project_documents = extract_project_documents(parsed)
    snapshot_documents = extract_snapshot_documents(parsed)
    report: dict[str, Any] = {
        **validation,
        "rejected_rows": 0,
        "projects_upserted": 0,
        "snapshots_upserted": 0,
        "projects_matched": 0,
        "snapshots_matched": 0,
        "dry_run": dry_run,
    }
    if dry_run:
        return report

    projects = target_database[PROJECTS_COLLECTION]
    snapshots = target_database[SNAPSHOTS_COLLECTION]
    effective_batch_size = batch_size if batch_size is not None else ingestion_batch_size()
    if effective_batch_size < 1:
        raise ValueError("batch_size must be a positive integer")
    created_indexes = _ensure_indexes(target_database)

    project_result = _bulk_upsert(
        projects,
        project_documents,
        ("project_id",),
        batch_size=effective_batch_size,
        collection_name=PROJECTS_COLLECTION,
    )
    snapshot_result = _bulk_upsert(
        snapshots,
        snapshot_documents,
        ("project_id", "snapshot_date"),
        batch_size=effective_batch_size,
        collection_name=SNAPSHOTS_COLLECTION,
    )
    report.update(
        projects_upserted=project_result.get("upserted", 0),
        snapshots_upserted=snapshot_result.get("upserted", 0),
        projects_matched=project_result.get("matched", 0),
        snapshots_matched=snapshot_result.get("matched", 0),
        batch_size=effective_batch_size,
        mongo_project_count=projects.count_documents({}),
        mongo_snapshot_count=snapshots.count_documents({}),
        indexes_created=created_indexes,
    )
    return report


def run_ingestion(
    source_path: Path | None = None,
    dry_run: bool = False,
    package_path: Path = MODEL_PACKAGE_PATH,
    batch_size: int | None = None,
) -> dict[str, Any]:
    dataframe = load_source_dataframe(source_path)
    return ingest_dataframe(
        dataframe,
        dry_run=dry_run,
        package_path=package_path,
        batch_size=batch_size,
    )