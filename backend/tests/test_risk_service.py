import unittest

from app.services.risk_service import calculate_risk


class RiskServiceTests(unittest.TestCase):
    def test_zero_inputs_produce_zero_risk(self):
        result = calculate_risk(0, 0, 0)
        self.assertEqual(result["risk_score"], 0.0)

    def test_known_probabilities_and_penalty(self):
        result = calculate_risk(0.2, 0.4, 0.5)
        self.assertAlmostEqual(result["risk_score"], 32.0)

    def test_full_cost_probability(self):
        result = calculate_risk(1, 0, 0)
        self.assertEqual(result["risk_score"], 45.0)

    def test_full_time_probability(self):
        result = calculate_risk(0, 1, 0)
        self.assertEqual(result["risk_score"], 45.0)

    def test_maximum_penalty(self):
        result = calculate_risk(0, 0, 1)
        self.assertEqual(result["risk_score"], 10.0)

    def test_invalid_inputs_are_rejected(self):
        for values in ((-0.1, 0, 0), (0, 1.1, 0), (0, 0, 2), (float("nan"), 0, 0)):
            with self.subTest(values=values):
                with self.assertRaises(ValueError):
                    calculate_risk(*values)

    def test_example_model_probabilities(self):
        result = calculate_risk(
            0.0026058835076256245,
            0.012721173367155227,
            0,
        )
        self.assertAlmostEqual(result["risk_score"], 0.6897175593651383)


if __name__ == "__main__":
    unittest.main()