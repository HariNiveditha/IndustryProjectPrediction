from __future__ import annotations

from collections.abc import Callable, Mapping, Sequence
from typing import Any

import numpy as np
import shap

from ml.feature_engineering import build_model_inputs
from ml.model_loader import ModelBundle, load_models


def _positive_class_values(values: Any, feature_count: int) -> np.ndarray:
	"""Normalize SHAP's binary-class output to one row of feature values."""
	if isinstance(values, list):
		if len(values) == 2:
			values = values[1]
		elif len(values) == 1:
			values = values[0]
		else:
			raise ValueError("Unsupported SHAP class output shape.")

	normalized = np.asarray(values)
	if normalized.ndim == 3:
		if normalized.shape[2] != 2:
			raise ValueError("Unsupported SHAP class output shape.")
		normalized = normalized[:, :, 1]
	if normalized.ndim != 2 or normalized.shape[0] != 1 or normalized.shape[1] != feature_count:
		raise ValueError(
			f"Expected one SHAP row with {feature_count} features; "
			f"received shape {normalized.shape}."
		)
	return normalized[0].astype(float)


def _explain_target(
	model: Any,
	feature_names: Sequence[str],
	input_frame: Any,
	target_name: str,
	top_n: int,
	explainer_factory: Callable[[Any], Any],
) -> dict[str, Any]:
	explainer = explainer_factory(model)
	explanation = explainer(input_frame)
	shap_values = _positive_class_values(explanation.values, len(feature_names))
	base_values = np.asarray(explanation.base_values).reshape(-1)
	if len(base_values) != 1:
		raise ValueError("Expected one SHAP base value for the input snapshot.")

	row = input_frame.iloc[0]
	features = []
	for index, feature_name in enumerate(feature_names):
		shap_value = float(shap_values[index])
		direction = "increases" if shap_value > 0 else "decreases" if shap_value < 0 else "neutral"
		features.append(
			{
				"feature_name": feature_name,
				"feature_value": row[feature_name].item() if hasattr(row[feature_name], "item") else row[feature_name],
				"shap_value": shap_value,
				"contribution": direction,
			}
		)

	top_contributors = sorted(
		features,
		key=lambda item: abs(item["shap_value"]),
		reverse=True,
	)[:top_n]
	return {
		"target": target_name,
		"base_value": float(base_values[0]),
		"features": features,
		"top_contributors": top_contributors,
	}


def explain_snapshot(
	snapshot: Mapping[str, Any],
	top_n: int = 10,
	models: ModelBundle | None = None,
	explainer_factory: Callable[[Any], Any] = shap.TreeExplainer,
) -> dict[str, dict[str, Any]]:
	"""Explain both packaged M2 predictions for one engineered snapshot."""
	if top_n < 1:
		raise ValueError("top_n must be greater than zero")

	loaded_models = models or load_models()
	cost_input, time_input = build_model_inputs(
		snapshot,
		loaded_models.cost_features,
		loaded_models.time_features,
	)
	return {
		"cost_overrun_target": _explain_target(
			loaded_models.cost_model,
			loaded_models.cost_features,
			cost_input,
			"cost_overrun_target",
			top_n,
			explainer_factory,
		),
		"time_overrun_target": _explain_target(
			loaded_models.time_model,
			loaded_models.time_features,
			time_input,
			"time_overrun_target",
			top_n,
			explainer_factory,
		),
	}
