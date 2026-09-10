from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.projects import router as projects_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.predictions import router as predictions_router
from app.api.routes.analytics import router as analytics_router
from app.api.routes.alerts import router as alerts_router


app = FastAPI(
    title="Industry Project Prediction API",
    description="Backend API for project risk prediction and early warning",
    version="1.0.0"
)


# Register API routes
app.include_router(projects_router)
app.include_router(dashboard_router)
app.include_router(predictions_router)
app.include_router(analytics_router)
app.include_router(alerts_router)


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