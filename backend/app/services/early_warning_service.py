from __future__ import annotations

import math
from collections.abc import Mapping
from numbers import Real
from typing import Any


PRIORITY_BY_SIGNAL_COUNT = {
	0: ("none", 0),
	1: ("medium", 1),
	2: ("high", 2),
	3: ("critical", 3),
}


def _required_mapping_value(mapping: Mapping[str, Any], key: str) -> Any:
	value = mapping.get(key)
	if value is None:
		raise ValueError(f"Early warning input is missing '{key}'.")
	return value


def _probability(prediction: Mapping[str, Any], target: str) -> float:
	value = _required_mapping_value(prediction, target).get("probability")
	if isinstance(value, bool) or not isinstance(value, Real):
		raise ValueError(f"{target}.probability must be a finite number between 0 and 1.")
	probability = float(value)
	if not math.isfinite(probability) or not 0 <= probability <= 1:
		raise ValueError(f"{target}.probability must be a finite number between 0 and 1.")
	return probability


def _binary_prediction(prediction: Mapping[str, Any], target: str) -> int:
	value = _required_mapping_value(prediction, target).get("prediction")
	if isinstance(value, bool) or value not in (0, 1):
		raise ValueError(f"{target}.prediction must be 0 or 1.")
	return int(value)


def _risk_score(risk: Mapping[str, Any]) -> float:
	value = _required_mapping_value(risk, "risk_score")
	if isinstance(value, bool) or not isinstance(value, Real):
		raise ValueError("risk_score must be a finite number between 0 and 100.")
	score = float(value)
	if not math.isfinite(score) or not 0 <= score <= 100:
		raise ValueError("risk_score must be a finite number between 0 and 100.")
	return score


def evaluate_early_warnings(
	predictions: Mapping[str, Any],
	anomalies: Mapping[str, Any],
	risk: Mapping[str, Any],
) -> dict[str, Any]:
	"""Combine existing signals into explainable early warnings.

	No probability or risk thresholds are applied because the project does
	not define any. Warnings trigger only on explicit categorical signals:
	anomaly_exists or a positive model prediction. Priority is the count of
	independent active signal groups, not a business severity policy.
	"""
	cost_probability = _probability(predictions, "cost_overrun_target")
	time_probability = _probability(predictions, "time_overrun_target")
	cost_prediction = _binary_prediction(predictions, "cost_overrun_target")
	time_prediction = _binary_prediction(predictions, "time_overrun_target")
	risk_score = _risk_score(risk)

	anomaly_exists = anomalies.get("anomaly_exists")
	if not isinstance(anomaly_exists, bool):
		raise ValueError("anomaly_exists must be a boolean.")
	anomaly_types = anomalies.get("anomaly_types", [])
	reasons = anomalies.get("reasons", [])
	if not isinstance(anomaly_types, list) or not isinstance(reasons, list):
		raise ValueError("anomaly_types and reasons must be lists.")

	warnings: list[dict[str, Any]] = []
	if anomaly_exists:
		warnings.append(
			{
				"type": "anomaly",
				"message": "The snapshot contains one or more supported anomaly signals.",
				"anomaly_types": anomaly_types,
				"reasons": reasons,
			}
		)
	if cost_prediction == 1:
		warnings.append(
			{
				"type": "cost_overrun_prediction",
				"message": "The cost-overrun model produced a positive prediction.",
				"probability": cost_probability,
			}
		)
	if time_prediction == 1:
		warnings.append(
			{
				"type": "time_overrun_prediction",
				"message": "The time-overrun model produced a positive prediction.",
				"probability": time_probability,
			}
		)

	signal_count = len(warnings)
	priority, priority_rank = PRIORITY_BY_SIGNAL_COUNT[signal_count]
	model_probabilities = {
		"cost_overrun": cost_probability,
		"time_overrun": time_probability,
	}
	return {
		"warning_exists": bool(warnings),
		"priority": priority,
		"priority_rank": priority_rank,
		"warnings": warnings,
		"risk_score": risk_score,
		"model_probabilities": model_probabilities,
		"anomaly": dict(anomalies),
	}
