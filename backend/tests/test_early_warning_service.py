import unittest

from app.services.early_warning_service import evaluate_early_warnings


def predictions(cost_prediction=0, time_prediction=0, cost_probability=0.2, time_probability=0.3):
    return {
        "cost_overrun_target": {"prediction": cost_prediction, "probability": cost_probability},
        "time_overrun_target": {"prediction": time_prediction, "probability": time_probability},
    }


def anomalies(exists=False):
    return {
        "anomaly_exists": exists,
        "anomaly_types": ["invalid_progress"] if exists else [],
        "reasons": ["progress is invalid"] if exists else [],
        "anomaly_penalty": 1.0 if exists else 0.0,
    }


class EarlyWarningServiceTests(unittest.TestCase):
    def test_normal_case_has_no_warning(self):
        result = evaluate_early_warnings(predictions(), anomalies(), {"risk_score": 0.0})
        self.assertFalse(result["warning_exists"])
        self.assertEqual(result["priority"], "none")
        self.assertEqual(result["warnings"], [])

    def test_anomaly_triggers_warning(self):
        result = evaluate_early_warnings(predictions(), anomalies(True), {"risk_score": 10.0})
        self.assertTrue(result["warning_exists"])
        self.assertEqual(result["priority"], "medium")
        self.assertEqual(result["warnings"][0]["type"], "anomaly")

    def test_positive_predictions_trigger_warnings(self):
        result = evaluate_early_warnings(
            predictions(cost_prediction=1, time_prediction=1),
            anomalies(),
            {"risk_score": 40.0},
        )
        self.assertEqual(result["priority"], "high")
        self.assertEqual(
            [warning["type"] for warning in result["warnings"]],
            ["cost_overrun_prediction", "time_overrun_prediction"],
        )

    def test_multiple_signal_groups_are_critical(self):
        result = evaluate_early_warnings(
            predictions(cost_prediction=1, time_prediction=1),
            anomalies(True),
            {"risk_score": 75.0},
        )
        self.assertEqual(result["priority"], "critical")
        self.assertEqual(result["priority_rank"], 3)
        self.assertEqual(len(result["warnings"]), 3)

    def test_priority_ordering_is_deterministic(self):
        results = [
            evaluate_early_warnings(predictions(), anomalies(), {"risk_score": 0}),
            evaluate_early_warnings(predictions(1), anomalies(), {"risk_score": 0}),
            evaluate_early_warnings(predictions(1, 1), anomalies(), {"risk_score": 0}),
            evaluate_early_warnings(predictions(1, 1), anomalies(True), {"risk_score": 0}),
        ]
        self.assertEqual([result["priority_rank"] for result in results], [0, 1, 2, 3])

    def test_missing_or_invalid_inputs_are_rejected(self):
        with self.assertRaises(ValueError):
            evaluate_early_warnings({}, anomalies(), {"risk_score": 0})
        with self.assertRaises(ValueError):
            evaluate_early_warnings(predictions(), anomalies(), {})
        with self.assertRaises(ValueError):
            evaluate_early_warnings(predictions(cost_probability=None), anomalies(), {"risk_score": 0})

    def test_output_is_deterministic(self):
        inputs = (predictions(1, 0), anomalies(True), {"risk_score": 55.0})
        self.assertEqual(evaluate_early_warnings(*inputs), evaluate_early_warnings(*inputs))


if __name__ == "__main__":
    unittest.main()