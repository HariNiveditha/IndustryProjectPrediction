from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes.alerts import router as alerts_router
from app.api.routes.analytics import router as analytics_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.predictions import router as predictions_router
from app.api.routes.projects import router as projects_router
from app.core.config import DATABASE_NAME
from app.core.database import test_connection


app = FastAPI(
    title="Industry Project Prediction API",
    description="Backend API for project risk prediction and early warning",
    version="1.0.0"
)


# Allow the React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(projects_router)
app.include_router(predictions_router)
app.include_router(alerts_router)
app.include_router(dashboard_router)
app.include_router(analytics_router)


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