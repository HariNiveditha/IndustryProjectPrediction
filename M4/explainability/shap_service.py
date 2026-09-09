import os
import joblib
import shap
import pandas as pd


# ---------------------------------------------------------
# Model paths
# ---------------------------------------------------------

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..")
)

MODEL_DIR = os.path.join(BASE_DIR, "M2", "models")


# ---------------------------------------------------------
# Load M2 models and feature lists
# ---------------------------------------------------------

cost_model = joblib.load(
    os.path.join(MODEL_DIR, "cost_overrun_model.pkl")
)

time_model = joblib.load(
    os.path.join(MODEL_DIR, "time_overrun_model.pkl")
)

cost_features = joblib.load(
    os.path.join(MODEL_DIR, "cost_features.pkl")
)

time_features = joblib.load(
    os.path.join(MODEL_DIR, "time_features.pkl")
)


# ---------------------------------------------------------
# Human-readable feature names
# ---------------------------------------------------------

FEATURE_NAMES = {
    "original_cost_cr": "Original Cost",
    "revised_cost_cr": "Revised Cost",
    "cumulative_expenditure_cr": "Cumulative Expenditure",
    "physical_progress_pct": "Physical Progress",
    "is_multi_state": "Multi-State Project",
    "progress_invalid_flag": "Invalid Progress Flag",
    "expenditure_invalid_flag": "Invalid Expenditure Flag",
    "expenditure_above_original_flag": "Expenditure Above Original Cost",
    "expenditure_above_revised_flag": "Expenditure Above Revised Cost",
    "prev_progress": "Previous Progress",
    "prev_expenditure": "Previous Expenditure",
    "prev_revised_cost": "Previous Revised Cost",
    "progress_growth": "Progress Growth",
    "expenditure_growth": "Expenditure Growth",
    "cost_growth": "Cost Growth",
    "expenditure_vs_original_ratio": "Expenditure vs Original Cost",
    "expenditure_vs_revised_ratio": "Expenditure vs Revised Cost",
    "months_since_prev_snapshot": "Months Since Previous Snapshot",
    "progress_velocity": "Progress Velocity",
    "expenditure_velocity": "Expenditure Velocity",
    "cost_overrun_ratio": "Cost Overrun Ratio",
    "cost_overrun_cr": "Cost Overrun",
    "planned_duration_days": "Planned Duration",
    "elapsed_duration_days": "Elapsed Duration",
    "time_elapsed_ratio": "Time Elapsed Ratio",
    "expected_progress_pct": "Expected Progress",
    "progress_gap": "Progress Gap",
    "schedule_pressure": "Schedule Pressure",
    "remaining_progress_pct": "Remaining Progress",
    "expenditure_intensity": "Expenditure Intensity",
}


# ---------------------------------------------------------
# SHAP explanation helper
# ---------------------------------------------------------

def _get_shap_explanation(model, features, project_features, top_n=3):

    # Create input using exactly the features used by M2
    X_project = pd.DataFrame(
        [[project_features.get(feature) for feature in features]],
        columns=features
    )

    # Create SHAP explainer
    explainer = shap.TreeExplainer(model)

    # Calculate SHAP values
    shap_values = explainer.shap_values(X_project)

    # Handle different SHAP output formats
    if isinstance(shap_values, list):
        project_shap = shap_values[1][0]
    else:
        project_shap = shap_values[0]

    # Build explanation table
    explanation = pd.DataFrame({
        "feature": features,
        "value": X_project.iloc[0].values,
        "shap_value": project_shap
    })

    explanation["importance"] = explanation["shap_value"].abs()

    # Select top drivers
    explanation = explanation.sort_values(
        "importance",
        ascending=False
    ).head(top_n)

    top_drivers = []

    for _, row in explanation.iterrows():

        feature = row["feature"]
        value = float(row["value"])
        shap_value = float(row["shap_value"])

        feature_name = FEATURE_NAMES.get(
            feature,
            feature.replace("_", " ").title()
        )

        if shap_value > 0:
            direction = "increases risk"

            explanation_text = (
                f"{feature_name} has a value of {value:.3f} "
                f"and is contributing to increased risk."
            )

        elif shap_value < 0:
            direction = "decreases risk"

            explanation_text = (
                f"{feature_name} has a value of {value:.3f} "
                f"and is reducing predicted risk."
            )

        else:
            direction = "no significant contribution"

            explanation_text = (
                f"{feature_name} has a value of {value:.3f} "
                f"and has little effect on predicted risk."
            )

        top_drivers.append({
            "feature": feature,
            "feature_name": feature_name,
            "value": round(value, 3),
            "shap_value": round(shap_value, 3),
            "direction": direction,
            "explanation": explanation_text
        })

    return top_drivers


# ---------------------------------------------------------
# Explain cost prediction
# ---------------------------------------------------------

def explain_cost(project_features, top_n=3):

    return _get_shap_explanation(
        cost_model,
        cost_features,
        project_features,
        top_n
    )


# ---------------------------------------------------------
# Explain time prediction
# ---------------------------------------------------------

def explain_time(project_features, top_n=3):

    return _get_shap_explanation(
        time_model,
        time_features,
        project_features,
        top_n
    )


# ---------------------------------------------------------
# Explain both predictions
# ---------------------------------------------------------

def explain_project(project_features, top_n=3):

    return {
        "cost_prediction_explanation": explain_cost(
            project_features,
            top_n
        ),

        "time_prediction_explanation": explain_time(
            project_features,
            top_n
        )
    }