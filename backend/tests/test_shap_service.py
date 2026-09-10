import unittest
from types import SimpleNamespace

import numpy as np

from app.services.shap_service import explain_snapshot


COST_FEATURES = ("cost_a", "cost_b")
TIME_FEATURES = ("time_a", "time_b", "time_c")


class FakeExplanation:
    def __init__(self, values, base_values):
        self.values = values
        self.base_values = base_values


class FakeExplainer:
    calls = []

    def __init__(self, model):
        self.model = model

    def __call__(self, frame):
        self.__class__.calls.append(list(frame.columns))
        values = np.array([[0.2, -0.8]]) if self.model == "cost" else np.array([[0.1, -0.3, 0.05]])
        return FakeExplanation(values, np.array([0.4]))


def fake_models():
    return SimpleNamespace(
        cost_model="cost",
        time_model="time",
        cost_features=COST_FEATURES,
        time_features=TIME_FEATURES,
    )


class ShapServiceTests(unittest.TestCase):
    def setUp(self):
        FakeExplainer.calls = []

    def test_preserves_exact_feature_order_for_both_targets(self):
        snapshot = {"cost_a": 1, "cost_b": 2, "time_a": 3, "time_b": 4, "time_c": 5}
        explain_snapshot(snapshot, models=fake_models(), explainer_factory=FakeExplainer)
        self.assertEqual(FakeExplainer.calls, [list(COST_FEATURES), list(TIME_FEATURES)])

    def test_explains_cost_and_time_targets(self):
        result = explain_snapshot(
            {"cost_a": 1, "cost_b": 2, "time_a": 3, "time_b": 4, "time_c": 5},
            top_n=2,
            models=fake_models(),
            explainer_factory=FakeExplainer,
        )
        self.assertEqual(set(result), {"cost_overrun_target", "time_overrun_target"})
        self.assertEqual(len(result["cost_overrun_target"]["features"]), 2)
        self.assertEqual(len(result["time_overrun_target"]["features"]), 3)
        self.assertEqual(len(result["cost_overrun_target"]["top_contributors"]), 2)

    def test_top_contributors_are_sorted_by_absolute_shap_value(self):
        result = explain_snapshot(
            {"cost_a": 1, "cost_b": 2, "time_a": 3, "time_b": 4, "time_c": 5},
            models=fake_models(),
            explainer_factory=FakeExplainer,
        )
        top = result["cost_overrun_target"]["top_contributors"]
        self.assertEqual([item["feature_name"] for item in top], ["cost_b", "cost_a"])

    def test_missing_required_feature_is_rejected(self):
        with self.assertRaises(ValueError):
            explain_snapshot(
                {"cost_a": 1, "cost_b": 2, "time_a": 3, "time_b": 4},
                models=fake_models(),
                explainer_factory=FakeExplainer,
            )

    def test_output_is_deterministic(self):
        snapshot = {"cost_a": 1, "cost_b": 2, "time_a": 3, "time_b": 4, "time_c": 5}
        first = explain_snapshot(snapshot, models=fake_models(), explainer_factory=FakeExplainer)
        second = explain_snapshot(snapshot, models=fake_models(), explainer_factory=FakeExplainer)
        self.assertEqual(first, second)


if __name__ == "__main__":
    unittest.main()