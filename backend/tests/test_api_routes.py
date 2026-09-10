import unittest
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from app.main import app


class ApiRouteTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_project_list_and_pagination_validation(self):
        projects = [{"project_id": "p1", "project_name": "Project"}]
        with patch("app.api.routes.projects.list_projects", return_value=projects):
            response = self.client.get("/projects?limit=1&skip=2")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["items"][0]["project_id"], "p1")
        self.assertEqual(response.json()["items"][0]["project_name"], "Project")
        self.assertEqual(response.json()["skip"], 2)
        self.assertEqual(self.client.get("/projects?limit=0").status_code, 422)

    def test_project_lookup_and_snapshot_lookup(self):
        project = {"project_id": "p1", "project_name": "Project"}
        snapshots = [{"project_id": "p1", "snapshot_date": "2026-07-01T00:00:00"}]
        with patch("app.api.routes.projects.get_project", return_value=project), patch(
            "app.api.routes.projects.get_project_snapshots", return_value=snapshots
        ):
            self.assertEqual(self.client.get("/projects/p1").status_code, 200)
            response = self.client.get("/projects/p1/snapshots")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["items"], snapshots)

        with patch("app.api.routes.projects.get_project", return_value=None):
            self.assertEqual(self.client.get("/projects/missing").status_code, 404)

    def test_prediction_endpoint_uses_pipeline_result(self):
        analysis = {
            "snapshot": {"snapshot_date": "2026-07-01T00:00:00"},
            "predictions": {
                "cost_overrun_target": {"prediction": 0, "probability": 0.2},
                "time_overrun_target": {"prediction": 1, "probability": 0.7},
            },
            "anomaly": {"anomaly_exists": False, "anomaly_types": [], "reasons": []},
            "risk": {"risk_score": 31.5},
            "early_warnings": {"warning_exists": True, "priority": "medium"},
        }
        with patch("app.api.routes.predictions.analyze_project", return_value=analysis):
            response = self.client.get("/predictions/p1")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["time_overrun_target"]["prediction"], 1)
        self.assertEqual(response.json()["risk"]["risk_score"], 31.5)

    def test_explanation_endpoint_uses_shap_service(self):
        analysis = {"snapshot": {"snapshot_date": "2026-07-01T00:00:00"}}
        explanations = {
            "cost_overrun_target": {"top_contributors": []},
            "time_overrun_target": {"top_contributors": []},
        }
        with patch("app.api.routes.predictions.analyze_project", return_value=analysis), patch(
            "app.api.routes.predictions.explain_snapshot", return_value=explanations
        ), patch("app.api.routes.predictions.get_explanation_record", return_value=None), patch(
            "app.api.routes.predictions.upsert_explanation_record"
        ):
            response = self.client.get("/predictions/p1/explanations")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["cost_overrun_target"], explanations["cost_overrun_target"])

    def test_alert_endpoint_derives_current_alerts(self):
        analysis = {
            "snapshot": {"snapshot_date": "2026-07-01T00:00:00"},
            "early_warnings": {"warning_exists": True, "priority": "high"},
            "risk": {"risk_score": 55.0},
            "anomaly": {"anomaly_exists": True, "anomaly_types": ["invalid_progress"]},
            "predictions": {
                "cost_overrun_target": {"probability": 0.2},
                "time_overrun_target": {"probability": 0.7},
            },
        }
        analysis["early_warnings"]["model_probabilities"] = {
            "cost_overrun": 0.2,
            "time_overrun": 0.7,
        }
        with patch("app.api.routes.alerts.analyze_project", return_value=analysis):
            response = self.client.get("/alerts/p1")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["early_warnings"]["priority"], "high")

    def test_dashboard_and_analytics_summary(self):
        projects_collection = MagicMock()
        snapshots_collection = MagicMock()
        projects_collection.count_documents.return_value = 9664
        snapshots_collection.count_documents.return_value = 23115
        snapshots_collection.aggregate.side_effect = [
            iter([{"projects_with_latest_anomaly": 4}]),
            iter([{
                "average_physical_progress_pct": 42.5,
                "total_original_cost_cr": 100.0,
                "total_revised_cost_cr": 120.0,
                "total_cumulative_expenditure_cr": 80.0,
                "first_snapshot_date": None,
                "latest_snapshot_date": None,
            }]),
        ]
        snapshots_collection.find_one.return_value = None
        snapshots_collection.distinct.return_value = list(range(16))
        fake_database = {"projects": projects_collection, "snapshots": snapshots_collection}
        with patch("app.api.routes.dashboard.database", fake_database), patch(
            "app.api.routes.analytics.database", fake_database
        ):
            dashboard = self.client.get("/dashboard/summary")
            analytics = self.client.get("/analytics/summary")
        self.assertEqual(dashboard.status_code, 200)
        self.assertEqual(dashboard.json()["projects_with_latest_anomaly"], 4)
        self.assertEqual(analytics.status_code, 200)
        self.assertEqual(analytics.json()["unique_snapshot_dates"], 16)


if __name__ == "__main__":
    unittest.main()