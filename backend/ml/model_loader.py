from dataclasses import dataclass
from functools import lru_cache
from io import BytesIO
from pathlib import Path
from typing import Any
from zipfile import BadZipFile, ZipFile

import joblib


PACKAGE_PATH = Path(__file__).resolve().parents[2] / "M2_model_package.zip"


@dataclass(frozen=True)
class ModelBundle:
	cost_model: Any
	time_model: Any
	cost_features: tuple[str, ...]
	time_features: tuple[str, ...]


def _load_artifact(package: ZipFile, name: str) -> Any:
	try:
		data = package.read(name)
	except KeyError as error:
		raise FileNotFoundError(
			f"Required model artifact '{name}' is missing from {PACKAGE_PATH}."
		) from error

	try:
		return joblib.load(BytesIO(data))
	except Exception as error:
		raise RuntimeError(
			f"Could not load model artifact '{name}' from {PACKAGE_PATH}."
		) from error


@lru_cache(maxsize=1)
def load_models() -> ModelBundle:
	if not PACKAGE_PATH.is_file():
		raise FileNotFoundError(
			f"M2 model package was not found at {PACKAGE_PATH}."
		)

	try:
		with ZipFile(PACKAGE_PATH) as package:
			bundle = ModelBundle(
				cost_model=_load_artifact(package, "cost_overrun_model.pkl"),
				time_model=_load_artifact(package, "time_overrun_model.pkl"),
				cost_features=tuple(_load_artifact(package, "cost_features.pkl")),
				time_features=tuple(_load_artifact(package, "time_features.pkl")),
			)
	except BadZipFile as error:
		raise RuntimeError(f"M2 model package is not a valid ZIP: {PACKAGE_PATH}.") from error

	_validate_bundle(bundle)
	return bundle


def _validate_bundle(bundle: ModelBundle) -> None:
	for name, model, features in (
		("cost", bundle.cost_model, bundle.cost_features),
		("time", bundle.time_model, bundle.time_features),
	):
		if not hasattr(model, "predict") or not hasattr(model, "predict_proba"):
			raise RuntimeError(f"The {name} model does not support classification inference.")

		expected_count = getattr(model, "n_features_in_", None)
		if expected_count is not None and expected_count != len(features):
			raise RuntimeError(
				f"The {name} model expects {expected_count} features, but its "
				f"feature artifact contains {len(features)}."
			)


models = load_models()
cost_model = models.cost_model
time_model = models.time_model
cost_features = list(models.cost_features)
time_features = list(models.time_features)
