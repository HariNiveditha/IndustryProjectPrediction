from __future__ import annotations

from collections.abc import Mapping
from typing import Any


SUPPORTED_ANOMALY_FLAGS = {
	"progress_invalid_flag": (
		"invalid_progress",
		"The snapshot contains the dataset's progress-invalid flag.",
	),
	"expenditure_invalid_flag": (
		"invalid_expenditure",
		"The snapshot contains the dataset's expenditure-invalid flag.",
	),
	"expenditure_above_original_flag": (
		"expenditure_above_original",
		"Cumulative expenditure is flagged above original cost.",
	),
	"expenditure_above_revised_flag": (
		"expenditure_above_revised",
		"Cumulative expenditure is flagged above revised cost.",
	),
	"approval_date_invalid_flag": (
		"invalid_approval_date",
		"The snapshot contains the dataset's approval-date-invalid flag.",
	),
	"revised_start_date_invalid_flag": (
		"invalid_revised_start_date",
		"The snapshot contains the dataset's revised-start-date-invalid flag.",
	),
	"target_doc_invalid_flag": (
		"invalid_target_date",
		"The snapshot contains the dataset's target-date-invalid flag.",
	),
	"revised_doc_invalid_flag": (
		"invalid_revised_date",
		"The snapshot contains the dataset's revised-date-invalid flag.",
	),
}


def _flag_value(snapshot: Mapping[str, Any], field: str) -> bool | None:
	if field not in snapshot or snapshot[field] is None:
		return None
	value = snapshot[field]
	if isinstance(value, bool):
		return value
	if isinstance(value, int) and value in (0, 1):
		return bool(value)
	raise ValueError(f"Anomaly flag '{field}' must be a boolean or 0/1 integer.")


def detect_anomalies(snapshot: Mapping[str, Any]) -> dict[str, Any]:
	"""Evaluate the explicit deterministic anomaly flags in one snapshot.

	The engineered dataset defines these flags, but does not define severity
	weights. Therefore the penalty is binary: 1.0 for any supported anomaly,
	otherwise 0.0. Missing flags are reported as unevaluated.
	"""
	anomaly_types: list[str] = []
	reasons: list[str] = []
	missing_fields: list[str] = []

	for field, (anomaly_type, reason) in SUPPORTED_ANOMALY_FLAGS.items():
		value = _flag_value(snapshot, field)
		if value is None:
			missing_fields.append(field)
		elif value:
			anomaly_types.append(anomaly_type)
			reasons.append(reason)

	return {
		"anomaly_exists": bool(anomaly_types),
		"anomaly_types": anomaly_types,
		"reasons": reasons,
		"anomaly_penalty": 1.0 if anomaly_types else 0.0,
		"missing_fields": missing_fields,
	}
