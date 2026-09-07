from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models.user import User
from app.models.job import Job
from app.models.proposal import Proposal

from app.routers.auth import router as auth_router
from app.routers.jobs import router as jobs_router
from app.routers.proposals import router as proposals_router
from app.routers.users import router as users_router
from app.routers.risk import router as risk_router

# =========================================================
# DATABASE TABLE CREATION
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="TrustHire AI",
    description="AI-powered cybersecurity-focused freelance hiring platform",
    version="1.0.0"
)


# =========================================================
# CORS CONFIGURATION
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# API ROUTERS
# =========================================================

app.include_router(auth_router)
app.include_router(jobs_router)
app.include_router(proposals_router)
app.include_router(users_router)
app.include_router(risk_router)


# =========================================================
# HOME / HEALTH ENDPOINT
# =========================================================

@app.get("/")
def home():
    return {
        "message": "TrustHire AI Backend Running 🚀"
    }