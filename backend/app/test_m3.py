from services.risk_service import (
    calculate_anomaly_adjustment,
    calculate_risk_score,
    get_risk_level
)

from services.rule_service import (
    generate_alerts,
    generate_early_warning,
    aggregate_anomaly_adjustment
)


project = {
    "project_id": 101,

    "original_cost_cr": 100,
    "cumulative_expenditure_cr": 60,

    "physical_progress_pct": 40,
    "prev_progress": 39.5,
    "prev_expenditure": 55,

    "months_since_prev_snapshot": 3,

    "planned_duration_days": 1000,
    "elapsed_duration_days": 850
}


# Generate alerts
alerts = generate_alerts(project)

print("\nALERTS")
print("=" * 50)

for alert in alerts:
    print(alert)


# Calculate anomaly
anomaly = aggregate_anomaly_adjustment(
    project,
    alerts
)

print("\nANOMALY ADJUSTMENT")
print("=" * 50)
print(anomaly)


# M2 predictions
cost_risk = 0.82
delay_risk = 0.74


# Calculate risk
risk_score = calculate_risk_score(
    cost_risk,
    delay_risk,
    anomaly
)

risk_level = get_risk_level(risk_score)

print("\nRISK SCORE")
print("=" * 50)
print(risk_score)

print("\nRISK LEVEL")
print("=" * 50)
print(risk_level)


# Early warning
warning = generate_early_warning(project)

print("\nEARLY WARNING")
print("=" * 50)
print(warning)