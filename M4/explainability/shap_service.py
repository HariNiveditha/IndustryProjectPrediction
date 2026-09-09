import shap
import pandas as pd


def explain_project(model, project_features, top_n=3):
    """
    Generate SHAP-based explanations for a single project.

    Parameters:
        model: Trained LightGBM model
        project_features: Dictionary containing project feature values
        top_n: Number of top drivers to return

    Returns:
        Dictionary containing top risk drivers and explanations
    """

    # Convert project features to DataFrame
    X_project = pd.DataFrame([project_features])

    # Create SHAP explainer
    explainer = shap.TreeExplainer(model)

    # Calculate SHAP values
    shap_values = explainer.shap_values(X_project)

    # Handle binary classifier output
    if isinstance(shap_values, list):
        project_shap = shap_values[1][0]
    else:
        project_shap = shap_values[0]

    # Create explanation table
    explanation = pd.DataFrame({
        "feature": X_project.columns,
        "value": X_project.iloc[0].values,
        "shap_value": project_shap
    })

    # Importance = absolute SHAP contribution
    explanation["importance"] = explanation["shap_value"].abs()

    # Get most important drivers
    explanation = explanation.sort_values(
        "importance",
        ascending=False
    ).head(top_n)

    # Feature names for display
    feature_names = {
        "expenditure_ratio": "Expenditure Ratio",
        "progress_gap": "Progress Gap",
        "schedule_pressure": "Schedule Pressure",
        "recent_expenditure_growth": "Recent Expenditure Growth"
    }

    top_drivers = []

    for _, row in explanation.iterrows():

        feature_name = feature_names.get(
            row["feature"],
            row["feature"]
        )

        if row["shap_value"] > 0:
            direction = "increases risk"
            explanation_text = (
                f"{feature_name} has a value of "
                f"{row['value']:.3f} and is contributing "
                f"to increased project risk."
            )
        else:
            direction = "decreases risk"
            explanation_text = (
                f"{feature_name} has a value of "
                f"{row['value']:.3f} and is reducing "
                f"the project's predicted risk."
            )

        top_drivers.append({
            "feature": row["feature"],
            "feature_name": feature_name,
            "value": round(float(row["value"]), 3),
            "shap_value": round(float(row["shap_value"]), 3),
            "direction": direction,
            "explanation": explanation_text
        })

    return {
        "top_risk_drivers": top_drivers
    }