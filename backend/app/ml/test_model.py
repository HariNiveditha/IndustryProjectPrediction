import pandas as pd

from app.ml.model_loader import (
    cost_model,
    cost_features,
    time_model,
    time_features
)

print("Testing Cost Model...")
print("Number of cost features:", len(cost_features))
print("Cost features:", cost_features)

print("\nTesting Time Model...")
print("Number of time features:", len(time_features))
print("Time features:", time_features)

# Create dummy input with 0 for every feature
cost_input = pd.DataFrame(
    [[0] * len(cost_features)],
    columns=cost_features
)

time_input = pd.DataFrame(
    [[0] * len(time_features)],
    columns=time_features
)

# Predictions
cost_prediction = cost_model.predict(cost_input)
cost_probability = cost_model.predict_proba(cost_input)

time_prediction = time_model.predict(time_input)
time_probability = time_model.predict_proba(time_input)

print("\n==============================")
print("COST MODEL RESULT")
print("==============================")
print("Prediction:", cost_prediction)
print("Probability:", cost_probability)

print("\n==============================")
print("TIME MODEL RESULT")
print("==============================")
print("Prediction:", time_prediction)
print("Probability:", time_probability)