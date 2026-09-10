from collections.abc import Mapping, Sequence
from math import isfinite
from typing import Any

import pandas as pd


def build_model_inputs(
	snapshot: Mapping[str, Any],
	cost_features: Sequence[str],
	time_features: Sequence[str],
) -> tuple[pd.DataFrame, pd.DataFrame]:
	"""Build ordered model inputs from an already feature-engineered snapshot.

	The M2 notebook trains on a feature-engineered CSV. It does not define the
	upstream numeric formulas, so this function validates and orders those
	existing fields without inventing or defaulting feature values.
	"""
	required_features = tuple(dict.fromkeys((*cost_features, *time_features)))
	missing_features = [feature for feature in required_features if feature not in snapshot]
	if missing_features:
		raise ValueError(
			"Snapshot is missing required M2 feature(s): "
			+ ", ".join(missing_features)
		)

	values = {feature: snapshot[feature] for feature in required_features}
	for feature, value in values.items():
		if isinstance(value, bool):
			values[feature] = int(value)
			continue
		if not isinstance(value, (int, float)) or not isfinite(value):
			raise ValueError(f"M2 feature '{feature}' must be a finite numeric value.")

	cost_input = pd.DataFrame([[values[feature] for feature in cost_features]], columns=cost_features)
	time_input = pd.DataFrame([[values[feature] for feature in time_features]], columns=time_features)
	return cost_input, time_input
