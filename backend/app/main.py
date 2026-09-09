from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import DATABASE_NAME
from app.core.database import test_connection
from app.routes.predictions import router as prediction_router


app = FastAPI(
    title="Industry Project Prediction API",
    description="Backend API for project risk prediction and early warning",
    version="1.0.0"
)


# Allow the React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Prediction routes
app.include_router(prediction_router)


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


@app.get("/health/db")
def database_health():
    if test_connection():
        return {
            "status": "connected",
            "database": DATABASE_NAME
        }

    return JSONResponse(
        status_code=503,
        content={"status": "disconnected", "database": DATABASE_NAME}
    )