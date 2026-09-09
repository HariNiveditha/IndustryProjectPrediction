import json
import pandas as pd

from shap_service import (
    explain_project,
    cost_model,
    time_model,
    cost_features,
    time_features
)


# ---------------------------------------------------------
# Load dataset
# ---------------------------------------------------------

DATA_PATH = "PAIMANA_feature_engineered_dataset.csv"

df = pd.read_csv(DATA_PATH, low_memory=False)

print("Dataset loaded:", df.shape)


# ---------------------------------------------------------
# Select a complete project snapshot
# ---------------------------------------------------------

required_features = list(
    dict.fromkeys(cost_features + time_features)
)

valid_rows = df.dropna(subset=required_features)

if valid_rows.empty:
    raise ValueError("No complete project row found.")

row = valid_rows.iloc[0]

project_features = row.to_dict()


# ---------------------------------------------------------
# Create model inputs
# ---------------------------------------------------------

X_cost = pd.DataFrame(
    [[project_features[f] for f in cost_features]],
    columns=cost_features
)

X_time = pd.DataFrame(
    [[project_features[f] for f in time_features]],
    columns=time_features
)


# ---------------------------------------------------------
# Get predictions
# ---------------------------------------------------------

cost_probability = cost_model.predict_proba(X_cost)[0][1]
time_probability = time_model.predict_proba(X_time)[0][1]

cost_prediction = cost_model.predict(X_cost)[0]
time_prediction = time_model.predict(X_time)[0]


# ---------------------------------------------------------
# Generate SHAP explanations
# ---------------------------------------------------------

result = explain_project(
    project_features,
    top_n=5
)


# ---------------------------------------------------------
# Display results
# ---------------------------------------------------------

print("\n" + "=" * 60)
print("PROJECT")
print("=" * 60)

print("ID:", row.get("project_id"))
print("Name:", row.get("project_name"))

print("\n" + "=" * 60)
print("M2 PREDICTIONS")
print("=" * 60)

print(f"Cost Overrun Prediction : {cost_prediction}")
print(f"Cost Overrun Probability: {cost_probability:.3f}")

print(f"Time Overrun Prediction : {time_prediction}")
print(f"Time Overrun Probability: {time_probability:.3f}")


print("\n" + "=" * 60)
print("M4 SHAP EXPLANATION")
print("=" * 60)

print(json.dumps(result, indent=2))