import unittest

import numpy as np
import pandas as pd

from app.services.dataset_ingestion_service import (
    DatasetValidationError,
    IngestionBatchError,
    extract_project_documents,
    extract_snapshot_documents,
    load_model_features,
    validate_source_dataframe,
    _bulk_upsert,
    _bson_value,
)


class FakeBulkResult:
    def __init__(self, upserted_count, matched_count, modified_count):
        self.upserted_count = upserted_count
        self.matched_count = matched_count
        self.modified_count = modified_count


class FakeCollection:
    def __init__(self, fail_on_call=None):
        self.documents = {}
        self.calls = []
        self.fail_on_call = fail_on_call

    def bulk_write(self, operations, ordered=False):
        self.calls.append((len(operations), ordered))
        if self.fail_on_call == len(self.calls):
            from pymongo.errors import NetworkTimeout

            raise NetworkTimeout("simulated timeout")
        upserted = 0
        matched = 0
        modified = 0
        for operation in operations:
            key = tuple(sorted(operation._filter.items()))
            if key in self.documents:
                matched += 1
                self.documents[key].update(operation._doc["$set"])
                modified += 1
            else:
                self.documents[key] = dict(operation._doc["$set"])
                upserted += 1
        return FakeBulkResult(upserted, matched, modified)

    def index_information(self):
        return {}

    def create_index(self, keys, unique=False):
        return "created"


class DatasetIngestionServiceTests(unittest.TestCase):
    def test_project_extraction_uses_one_document_per_project(self):
        dataframe = pd.DataFrame(
            [
                {"project_id": "p1", "project_name": "Project", "project_name_normalized": "project", "project_code": np.nan, "format": "new"},
                {"project_id": "p1", "project_name": "Project", "project_name_normalized": "project", "project_code": "C1", "format": "new"},
                {"project_id": "p2", "project_name": "Other", "project_name_normalized": "other", "project_code": "C2", "format": "old"},
            ]
        )
        projects = extract_project_documents(dataframe)
        self.assertEqual(len(projects), 2)
        self.assertEqual(projects[0]["project_code"], "C1")

    def test_snapshot_extraction_preserves_nan_as_none(self):
        dataframe = pd.DataFrame(
            [
                {
                    "project_id": "p1",
                    "snapshot_date": pd.Timestamp("2025-04-01"),
                    "valid_date": pd.Timestamp("2025-05-01"),
                    "missing_date": pd.NaT,
                    "nested": {"missing_date": pd.NaT},
                    "values": [pd.NaT, pd.Timestamp("2025-06-01")],
                    "value": np.nan,
                }
            ]
        )
        snapshot = extract_snapshot_documents(dataframe)[0]
        self.assertIsNone(snapshot["value"])
        self.assertIsNone(snapshot["missing_date"])
        self.assertIsNone(snapshot["nested"]["missing_date"])
        self.assertIsNone(snapshot["values"][0])
        self.assertIsInstance(snapshot["valid_date"], __import__("datetime").datetime)
        self.assertIsInstance(snapshot["values"][1], __import__("datetime").datetime)
        self.assertEqual(snapshot["snapshot_date"].isoformat(), "2025-04-01T00:00:00")

    def test_bson_conversion_handles_numpy_scalars(self):
        self.assertEqual(_bson_value(np.int64(3)), 3)
        self.assertIsNone(_bson_value(np.float64(np.nan)))

    def test_bulk_upsert_is_idempotent(self):
        collection = FakeCollection()
        documents = [{"project_id": "p1", "snapshot_date": "2025-04-01", "value": 1}]
        first = _bulk_upsert(collection, documents, ("project_id", "snapshot_date"))
        second = _bulk_upsert(collection, documents, ("project_id", "snapshot_date"))
        self.assertEqual(first["upserted"], 1)
        self.assertEqual(second["upserted"], 0)
        self.assertEqual(second["matched"], 1)
        self.assertEqual(len(collection.documents), 1)

    def test_bulk_upsert_batches_operations(self):
        collection = FakeCollection()
        documents = [{"project_id": f"p{index}"} for index in range(5)]
        result = _bulk_upsert(
            collection,
            documents,
            ("project_id",),
            batch_size=2,
            collection_name="projects",
        )
        self.assertEqual([call[0] for call in collection.calls], [2, 2, 1])
        self.assertTrue(all(call[1] is False for call in collection.calls))
        self.assertEqual(result["upserted"], 5)

    def test_failed_batch_keeps_completed_batches_for_resume(self):
        collection = FakeCollection(fail_on_call=2)
        documents = [{"project_id": f"p{index}"} for index in range(5)]
        with self.assertRaises(IngestionBatchError) as context:
            _bulk_upsert(
                collection,
                documents,
                ("project_id",),
                batch_size=2,
                collection_name="projects",
            )
        self.assertIn("projects batch 2", str(context.exception))
        self.assertEqual(len(collection.documents), 2)

        collection.fail_on_call = None
        result = _bulk_upsert(
            collection,
            documents,
            ("project_id",),
            batch_size=2,
            collection_name="projects",
        )
        self.assertEqual(result["upserted"], 3)
        self.assertEqual(len(collection.documents), 5)

    def test_duplicate_detection_is_rejected(self):
        cost_features, time_features = load_model_features()
        columns = list(dict.fromkeys((*cost_features, *time_features)))
        dataframe = pd.DataFrame(
            [{"project_id": "p1", "snapshot_date": "2025-04-01", **{column: 0 for column in columns}},
             {"project_id": "p1", "snapshot_date": "2025-04-01", **{column: 0 for column in columns}}]
        )
        with self.assertRaises(DatasetValidationError):
            validate_source_dataframe(dataframe, enforce_expected_counts=False)


if __name__ == "__main__":
    unittest.main()