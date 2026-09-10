def _number(value, default=0.0):
    """Safely convert a value to a number."""
    try:
        if value is None:
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def check_stagnation(project):
    """
    Detect stagnation when physical progress barely changes
    while expenditure continues to increase.

    Conditions:
    - At least ~60 days since previous snapshot
    - Progress change < 1%
    - Expenditure increase > 5%
    """

    current_progress = _number(
        project.get("physical_progress_pct")
    )

    previous_progress = _number(
        project.get("prev_progress")
    )

    current_expenditure = _number(
        project.get("cumulative_expenditure_cr")
    )

    previous_expenditure = _number(
        project.get("prev_expenditure")
    )

    days = _number(
        project.get("days_since_prev_snapshot")
    )

    if days <= 0:
        months = _number(
            project.get("months_since_prev_snapshot")
        )
        days = months * 30

    progress_change = (
        current_progress - previous_progress
    )

    if previous_expenditure > 0:
        expenditure_change = (
            (current_expenditure - previous_expenditure)
            / previous_expenditure
        ) * 100
    else:
        expenditure_change = 0

    if (
        days >= 60
        and progress_change < 1
        and expenditure_change > 5
    ):
        return {
            "type": "STAGNATION",
            "severity": "HIGH",
            "message": (
                "Physical progress has remained almost unchanged "
                "while expenditure increased."
            )
        }

    return None


def check_progress_expenditure_gap(project):
    """
    Detect when expenditure is significantly ahead
    of physical progress.

    Condition:
    expenditure percentage - physical progress > 30%
    """

    original_cost = _number(
        project.get("original_cost_cr")
    )

    expenditure = _number(
        project.get("cumulative_expenditure_cr")
    )

    progress = _number(
        project.get("physical_progress_pct")
    )

    if original_cost <= 0:
        return None

    expenditure_percentage = (
        expenditure / original_cost
    ) * 100

    gap = expenditure_percentage - progress

    if gap > 30:
        return {
            "type": "PROGRESS_EXPENDITURE_GAP",
            "severity": "HIGH",
            "message": (
                "Expenditure is significantly ahead of "
                "physical progress."
            )
        }

    return None


def check_schedule_pressure(project):
    """
    Detect schedule pressure.

    Conditions:
    - More than 80% of planned duration has elapsed
    - Physical progress is below 50%
    """

    planned_duration = _number(
        project.get("planned_duration_days")
    )

    elapsed_duration = _number(
        project.get("elapsed_duration_days")
    )

    progress = _number(
        project.get("physical_progress_pct")
    )

    if planned_duration <= 0:
        return None

    elapsed_ratio = (
        elapsed_duration / planned_duration
    )

    if (
        elapsed_ratio > 0.80
        and progress < 50
    ):
        return {
            "type": "SCHEDULE_PRESSURE",
            "severity": "HIGH",
            "message": (
                "More than 80% of the planned duration has elapsed "
                "while physical progress remains below 50%."
            )
        }

    return None


def generate_alerts(project):
    """
    Run all risk-monitoring rules and return
    the triggered alerts.
    """

    alerts = []

    stagnation = check_stagnation(project)
    gap = check_progress_expenditure_gap(project)
    schedule = check_schedule_pressure(project)

    if stagnation:
        alerts.append(stagnation)

    if gap:
        alerts.append(gap)

    if schedule:
        alerts.append(schedule)

    return alerts


def generate_early_warning(project):
    """
    Generate an early-warning message from active alerts.
    """

    alerts = generate_alerts(project)

    if not alerts:
        return {
            "warning": False,
            "severity": "LOW",
            "message": (
                "No immediate early-warning condition detected."
            )
        }

    severity_rank = {
        "LOW": 1,
        "MEDIUM": 2,
        "HIGH": 3,
        "CRITICAL": 4
    }

    highest_severity = max(
        alerts,
        key=lambda alert: severity_rank.get(
            alert["severity"], 1
        )
    )["severity"]

    alert_types = ", ".join(
        alert["type"] for alert in alerts
    )

    return {
        "warning": True,
        "severity": highest_severity,
        "message": (
            f"Early warning: {alert_types} condition(s) "
            "require attention."
        )
    }


def aggregate_anomaly_adjustment(project, alerts=None):
    """
    Produce one normalized anomaly adjustment.

    Uses the expenditure-progress gap and the severity
    of triggered rules. The maximum is used to avoid
    double-counting multiple alerts.
    """

    from services.risk_service import calculate_anomaly_adjustment

    gap_adjustment = calculate_anomaly_adjustment(
        project.get("physical_progress_pct", 0),
        project.get("cumulative_expenditure_cr", 0),
        project.get("original_cost_cr", 0)
    )

    if alerts is None:
        alerts = generate_alerts(project)

    severity_values = {
        "LOW": 0.25,
        "MEDIUM": 0.50,
        "HIGH": 0.75,
        "CRITICAL": 1.00
    }

    rule_adjustment = 0.0

    for alert in alerts:
        rule_adjustment = max(
            rule_adjustment,
            severity_values.get(
                alert.get("severity"),
                0.0
            )
        )

    return round(
        max(gap_adjustment, rule_adjustment),
        4
    )