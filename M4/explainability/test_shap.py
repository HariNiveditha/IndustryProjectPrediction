import pandas as pd
import shap
from lightgbm import LGBMClassifier

from shap_service import explain_project


# ============================================================
# 1. Create training data
# ============================================================

data = {
    "expenditure_ratio": [
        0.20, 0.25, 0.30, 0.35, 0.40,
        0.45, 0.50, 0.55, 0.60, 0.65,
        0.70, 0.75, 0.80, 0.85, 0.90,
        0.95, 0.30, 0.70, 0.85, 0.45
    ],

    "progress_gap": [
        0.05, 0.08, 0.10, 0.12, 0.15,
        0.18, 0.20, 0.22, 0.25, 0.28,
        0.30, 0.32, 0.35, 0.38, 0.40,
        0.42, 0.30, 0.05, 0.35, 0.10
    ],

    "schedule_pressure": [
        0.10, 0.15, 0.20, 0.25, 0.30,
        0.35, 0.40, 0.45, 0.50, 0.55,
        0.60, 0.65, 0.70, 0.75, 0.80,
        0.90, 0.85, 0.20, 0.80, 0.30
    ],

    "recent_expenditure_growth": [
        0.02, 0.03, 0.05, 0.06, 0.08,
        0.10, 0.12, 0.14, 0.16, 0.18,
        0.20, 0.22, 0.25, 0.28, 0.30,
        0.35, 0.40, 0.05, 0.30, 0.10
    ]
}

X = pd.DataFrame(data)


# ============================================================
# 2. Create temporary risk labels
# ============================================================

y = (
    (X["expenditure_ratio"] > 0.65) |
    (X["progress_gap"] > 0.25) |
    (X["schedule_pressure"] > 0.65)
).astype(int)


# ============================================================
# 3. Train temporary LightGBM model
# ============================================================

model = LGBMClassifier(
    n_estimators=100,
    learning_rate=0.05,
    max_depth=3,
    min_child_samples=2,
    random_state=42,
    verbosity=-1
)
model.fit(X, y)


# ============================================================
# 4. Project that we want to explain
# ============================================================

project = {
    "expenditure_ratio": 0.679,
    "progress_gap": 0.359,
    "schedule_pressure": 0.844,
    "recent_expenditure_growth": 0.044
}


# ============================================================
# 5. Generate SHAP explanation using our M4 service
# ============================================================

result = explain_project(model, project)


# ============================================================
# 6. Debug SHAP output directly
# ============================================================

print("\nDEBUG")
print("-----")

debug_data = pd.DataFrame([project])

debug_explainer = shap.TreeExplainer(model)
debug_values = debug_explainer.shap_values(debug_data)

print("SHAP output type:", type(debug_values))

if isinstance(debug_values, list):

    print("Number of outputs:", len(debug_values))

    for i, values in enumerate(debug_values):
        print(f"Output {i} shape:", values.shape)
        print(f"Output {i} values:", values)

else:

    print("SHAP output shape:", debug_values.shape)
    print("SHAP output values:", debug_values)


# ============================================================
# 7. Display final explanation
# ============================================================

print("\nSHAP EXPLANATION")
print("================")

for driver in result["top_risk_drivers"]:

    print(f"\n{driver['feature_name']}")
    print(f"Value: {driver['value']}")
    print(f"SHAP value: {driver['shap_value']}")
    print(f"Direction: {driver['direction']}")
    print(f"Explanation: {driver['explanation']}")