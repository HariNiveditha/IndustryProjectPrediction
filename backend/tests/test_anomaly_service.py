import unittest

from app.services.anomaly_service import SUPPORTED_ANOMALY_FLAGS, detect_anomalies


def normal_snapshot():
    return {field: False for field in SUPPORTED_ANOMALY_FLAGS}


class AnomalyServiceTests(unittest.TestCase):
    def test_normal_snapshot_has_no_anomaly(self):
        result = detect_anomalies(normal_snapshot())
        self.assertFalse(result["anomaly_exists"])
        self.assertEqual(result["anomaly_types"], [])
        self.assertEqual(result["anomaly_penalty"], 0.0)
        self.assertEqual(result["missing_fields"], [])

    def test_each_supported_condition_is_detected(self):
        for field, (anomaly_type, _) in SUPPORTED_ANOMALY_FLAGS.items():
            with self.subTest(field=field):
                snapshot = normal_snapshot()
                snapshot[field] = True
                result = detect_anomalies(snapshot)
                self.assertTrue(result["anomaly_exists"])
                self.assertEqual(result["anomaly_types"], [anomaly_type])
                self.assertEqual(result["anomaly_penalty"], 1.0)

    def test_multiple_conditions_are_reported(self):
        snapshot = normal_snapshot()
        snapshot["progress_invalid_flag"] = True
        snapshot["expenditure_above_original_flag"] = True
        result = detect_anomalies(snapshot)
        self.assertEqual(
            result["anomaly_types"],
            ["invalid_progress", "expenditure_above_original"],
        )
        self.assertEqual(len(result["reasons"]), 2)
        self.assertEqual(result["anomaly_penalty"], 1.0)

    def test_missing_flags_are_reported_without_inventing_anomalies(self):
        result = detect_anomalies({})
        self.assertFalse(result["anomaly_exists"])
        self.assertEqual(result["anomaly_penalty"], 0.0)
        self.assertEqual(set(result["missing_fields"]), set(SUPPORTED_ANOMALY_FLAGS))

    def test_invalid_flag_values_are_rejected(self):
        snapshot = normal_snapshot()
        snapshot["progress_invalid_flag"] = 2
        with self.assertRaises(ValueError):
            detect_anomalies(snapshot)

    def test_output_is_deterministic(self):
        snapshot = normal_snapshot()
        snapshot["target_doc_invalid_flag"] = True
        self.assertEqual(detect_anomalies(snapshot), detect_anomalies(snapshot))


if __name__ == "__main__":
    unittest.main()