from __future__ import annotations

import math
from numbers import Real
from typing import Any


COST_WEIGHT = 0.45
TIME_WEIGHT = 0.45
PENALTY_WEIGHT = 0.10


def _validate_probability(name: str, value: Any) -> float:
	if isinstance(value, bool) or not isinstance(value, Real):
		raise ValueError(f"{name} must be a numeric value between 0 and 1.")
	numeric_value = float(value)
	if not math.isfinite(numeric_value) or not 0 <= numeric_value <= 1:
		raise ValueError(f"{name} must be a numeric value between 0 and 1.")
	return numeric_value


def calculate_risk(
	cost_probability: Real,
	time_probability: Real,
	anomaly_penalty: Real,
) -> dict[str, float]:
	"""Calculate the agreed risk score from model probabilities and a penalty.

	Anomaly detection remains outside this service. ``anomaly_penalty`` must be
	supplied by the separate anomaly service and is expected to be normalized
	to the inclusive range 0 to 1.
	"""
	validated_cost = _validate_probability("cost_probability", cost_probability)
	validated_time = _validate_probability("time_probability", time_probability)
	validated_penalty = _validate_probability("anomaly_penalty", anomaly_penalty)

	raw_score = (
		COST_WEIGHT * validated_cost
		+ TIME_WEIGHT * validated_time
		+ PENALTY_WEIGHT * validated_penalty
	) * 100
	risk_score = max(0.0, min(100.0, raw_score))

	return {
		"cost_probability": validated_cost,
		"time_probability": validated_time,
		"anomaly_penalty": validated_penalty,
		"risk_score": risk_score,
	}
