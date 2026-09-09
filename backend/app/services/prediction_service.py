from collections.abc import Mapping
from typing import Any

from ml.feature_engineering import build_model_inputs
from ml.model_loader import load_models


def predict(snapshot: Mapping[str, Any]) -> dict[str, dict[str, float | int]]:
	"""Run the packaged M2 cost and schedule classifiers."""
	models = load_models()
	cost_input, time_input = build_model_inputs(
		snapshot,
		models.cost_features,
		models.time_features,
	)

	cost_prediction = int(models.cost_model.predict(cost_input)[0])
	time_prediction = int(models.time_model.predict(time_input)[0])
	cost_probability = float(models.cost_model.predict_proba(cost_input)[0][1])
	time_probability = float(models.time_model.predict_proba(time_input)[0][1])

	return {
		"cost_overrun_target": {
			"prediction": cost_prediction,
			"probability": cost_probability,
		},
		"time_overrun_target": {
			"prediction": time_prediction,
			"probability": time_probability,
		},
	}
