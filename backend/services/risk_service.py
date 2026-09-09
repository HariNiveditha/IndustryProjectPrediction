def clamp(value, minimum=0.0, maximum=1.0):
    """Keep a value within a specified range."""
    return max(minimum, min(float(value), maximum))


def calculate_anomaly_adjustment(
    physical_progress,
    cumulative_expenditure,
    original_cost
):
    """
    Calculate anomaly adjustment based on the
    expenditure-progress gap.

    Expenditure % = cumulative expenditure / original cost * 100

    Efficiency gap = physical progress - expenditure %

    If expenditure is ahead of physical progress,
    the anomaly adjustment increases.
    """

    if original_cost is None or float(original_cost) <= 0:
        return 0.0

    physical_progress = max(
        0.0, min(float(physical_progress), 100.0)
    )

    cumulative_expenditure = max(
        0.0, float(cumulative_expenditure)
    )

    original_cost = float(original_cost)

    expenditure_percentage = (
        cumulative_expenditure / original_cost
    ) * 100

    anomaly = (
        expenditure_percentage - physical_progress
    ) / 100

    return round(clamp(anomaly), 4)


def calculate_risk_score(
    cost_risk,
    delay_risk,
    anomaly_adjustment
):
    """
    Calculate final project risk score from 0 to 100.

    Cost risk  : 45%
    Delay risk : 45%
    Anomaly    : 10%
    """

    cost_risk = clamp(cost_risk)
    delay_risk = clamp(delay_risk)
    anomaly_adjustment = clamp(anomaly_adjustment)

    risk_score = (
        0.45 * cost_risk
        + 0.45 * delay_risk
        + 0.10 * anomaly_adjustment
    ) * 100

    return round(
        max(0.0, min(risk_score, 100.0)),
        2
    )


def get_risk_level(risk_score):
    """
    Convert numerical risk score into a risk category.

    0-34   : LOW
    35-64  : MEDIUM
    65-79  : HIGH
    80-100 : CRITICAL
    """

    risk_score = float(risk_score)

    if risk_score >= 80:
        return "CRITICAL"

    elif risk_score >= 65:
        return "HIGH"

    elif risk_score >= 35:
        return "MEDIUM"

    else:
        return "LOW"