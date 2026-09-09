from fastapi import APIRouter
from pydantic import BaseModel

import pandas as pd

from app.ml.model_loader import (
    cost_model,
    cost_features,
    time_model,
    time_features
)


router = APIRouter()


# -----------------------------
# Input data from frontend
# -----------------------------

class PredictionInput(BaseModel):
    original_cost_cr: float
    revised_cost_cr: float
    cumulative_expenditure_cr: float
    physical_progress_pct: float


# -----------------------------
# Risk Level
# -----------------------------
def get_risk_level(risk_score: float):

    if risk_score >= 85:
        return "CRITICAL"

    elif risk_score >= 65:
        return "HIGH"

    elif risk_score >= 40:
        return "MEDIUM"

    else:
        return "LOW"


# -----------------------------
# Prediction API
# -----------------------------

@router.post("/predict")
def predict_risk(data: PredictionInput):

    # Temporary feature values
    # We will replace these with
    # proper calculations later.

    values = {
        "original_cost_cr": data.original_cost_cr,
        "revised_cost_cr": data.revised_cost_cr,
        "cumulative_expenditure_cr": data.cumulative_expenditure_cr,
        "physical_progress_pct": data.physical_progress_pct,

        "is_multi_state": 0,
        "progress_invalid_flag": 0,
        "expenditure_invalid_flag": 0,
        "expenditure_above_original_flag": 0,
        "expenditure_above_revised_flag": 0,
        "approval_date_invalid_flag": 0,
        "revised_start_date_invalid_flag": 0,
        "target_doc_invalid_flag": 0,
        "revised_doc_invalid_flag": 0,

        "prev_progress": 0,
        "prev_expenditure": 0,
        "prev_revised_cost": data.revised_cost_cr,

        "progress_growth": 0,
        "expenditure_growth": 0,
        "cost_growth": 0,

        "expenditure_vs_original_ratio":
            data.cumulative_expenditure_cr / max(data.original_cost_cr, 1),

        "expenditure_vs_revised_ratio":
            data.cumulative_expenditure_cr / max(data.revised_cost_cr, 1),

        "months_since_prev_snapshot": 0,

        "progress_velocity": 0,
        "expenditure_velocity": 0,

        "cost_overrun_ratio":
            max(
                0,
                (data.revised_cost_cr - data.original_cost_cr)
                / max(data.original_cost_cr, 1)
            ),

        "cost_overrun_cr":
            max(
                0,
                data.revised_cost_cr - data.original_cost_cr
            ),

        "planned_duration_days": 365,
        "elapsed_duration_days": 0,

        "time_elapsed_ratio": 0,
        "expected_progress_pct": 0,

        "progress_gap": 0,
        "schedule_pressure": 0,

        "remaining_progress_pct":
            max(0, 100 - data.physical_progress_pct),

        "expenditure_intensity":
            data.cumulative_expenditure_cr
            / max(data.physical_progress_pct, 1)
    }


    # -----------------------------
    # Cost Model
    # -----------------------------

    cost_input = pd.DataFrame(
        [[values[feature] for feature in cost_features]],
        columns=cost_features
    )

    cost_probability = cost_model.predict_proba(cost_input)[0][1]


    # -----------------------------
    # Time Model
    # -----------------------------

    time_input = pd.DataFrame(
        [[values[feature] for feature in time_features]],
        columns=time_features
    )

    delay_probability = time_model.predict_proba(time_input)[0][1]


    # -----------------------------
    # Overall Risk Score
    # -----------------------------

    cost_risk = cost_probability * 100
    delay_risk = delay_probability * 100

    risk_score = (
        cost_risk * 0.5
        + delay_risk * 0.5
    )

    risk_score = round(risk_score, 2)

    risk_level = get_risk_level(risk_score)


    # -----------------------------
    # Response
    # -----------------------------

    return {
        "cost_risk": round(cost_risk, 2),
        "delay_risk": round(delay_risk, 2),
        "risk_score": risk_score,
        "risk_level": risk_level
    }