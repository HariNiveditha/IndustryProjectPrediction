from pathlib import Path
import joblib


# Location of the models folder
BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"


# Load cost overrun files
cost_features = joblib.load(MODEL_DIR / "cost_features.pkl")
cost_model = joblib.load(MODEL_DIR / "cost_overrun_model.pkl")


# Load time overrun files
time_features = joblib.load(MODEL_DIR / "time_features.pkl")
time_model = joblib.load(MODEL_DIR / "time_overrun_model.pkl")


print("✅ Cost model loaded")
print("✅ Time model loaded")
print("Cost features:", type(cost_features))
print("Time features:", type(time_features))