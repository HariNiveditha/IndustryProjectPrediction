import unittest
from unittest.mock import MagicMock, patch

from app.services.persistence_service import (
    ensure_persistence_indexes,
    upsert_explanation_record,
    upsert_prediction_record,
    upsert_warning_alerts,
)


class PersistenceServiceTests(unittest.TestCase):
    def setUp(self):
        self.database = {"predictions": MagicMock(), "explanations": MagicMock(), "alerts": MagicMock()}
        for collection in self.database.values():
            collection.index_information.return_value = {"_id_": {"key": [("_id", 1)]}}
            def remember_index(keys, unique=False, name=None, collection=collection):
                collection.index_information.return_value[name] = {"key": keys, "unique": unique}
                return name
            collection.create_index.side_effect = remember_index

    def test_indexes_are_unique_and_idempotent_to_ensure(self):
        ensure_persistence_indexes(self.database)
        ensure_persistence_indexes(self.database)
        self.assertEqual(self.database["predictions"].create_index.call_count, 1)
        self.assertEqual(self.database["explanations"].create_index.call_count, 1)
        self.assertEqual(self.database["alerts"].create_index.call_count, 1)
        prediction_keys = self.database["predictions"].create_index.call_args.args
        self.assertEqual(prediction_keys[0], [("project_id", 1), ("snapshot_date", 1)])
        self.assertTrue(self.database["predictions"].create_index.call_args.kwargs["unique"])

    @patch("app.services.persistence_service.ensure_persistence_indexes")
    def test_prediction_upsert_uses_project_snapshot_key(self, ensure_indexes):
        upsert_prediction_record(
            "p1",
            "2026-07-01T00:00:00",
            {"cost_overrun_target": {"prediction": 0, "probability": 0.1}},
            {"anomaly_exists": False},
            {"risk_score": 10.0},
            {"warning_exists": False, "model_probabilities": {"cost_overrun": 0.1, "time_overrun": 0.2}},
            self.database,
        )
        call = self.database["predictions"].update_one.call_args
        self.assertEqual(call.args[0], {"project_id": "p1", "snapshot_date": "2026-07-01T00:00:00"})
        self.assertTrue(call.kwargs["upsert"])

    @patch("app.services.persistence_service.ensure_persistence_indexes")
    def test_explanation_upsert_is_single_record(self, ensure_indexes):
        upsert_explanation_record("p1", "d1", {"cost_overrun_target": {}, "time_overrun_target": {}}, self.database)
        self.assertEqual(self.database["explanations"].update_one.call_count, 1)
        self.assertTrue(self.database["explanations"].update_one.call_args.kwargs["upsert"])

    @patch("app.services.persistence_service.ensure_persistence_indexes")
    def test_alerts_are_only_written_for_active_warning_types(self, ensure_indexes):
        no_alerts = upsert_warning_alerts("p1", "d1", {"warning_exists": False, "warnings": []}, {}, {}, {}, self.database)
        self.assertEqual(no_alerts, 0)
        self.database["alerts"].bulk_write.reset_mock()
        count = upsert_warning_alerts(
            "p1", "d1",
            {"warning_exists": True, "warnings": [{"type": "anomaly"}, {"type": "cost_overrun_prediction"}]},
            {"risk_score": 50.0}, {"anomaly_exists": True}, {"cost_overrun": 0.5, "time_overrun": 0.1},
            self.database,
        )
        self.assertEqual(count, 2)
        self.assertEqual(self.database["alerts"].bulk_write.call_count, 1)


if __name__ == "__main__":
    unittest.main()