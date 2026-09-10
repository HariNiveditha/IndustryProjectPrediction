from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# M3 risk and early-warning APIs
from app.api.risks import router as risk_router
from app.api.alerts import router as m3_alerts_router

# Existing backend APIs
from app.routes.predictions import router as prediction_router
from app.routes.auth import router as auth_router


app = FastAPI(
    title="Industry Project Prediction API",
    description="Backend API for project risk prediction and early warning",
    version="1.0.0"
)


# M3 risk and early-warning APIs
app.include_router(risk_router)
app.include_router(m3_alerts_router)

# Existing backend APIs
app.include_router(prediction_router)
app.include_router(auth_router)


# Allow the React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Industry Project Prediction API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }