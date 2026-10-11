
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import FRONTEND_URL
from app.database import Base, engine
from app.routers.auth import router as auth_router
from app.routers.jobs import router as jobs_router
from app.routers.payments import router as payments_router
from app.routers.proposals import router as proposals_router
from app.routers.reviews import router as reviews_router
from app.routers.risk import router as risk_router
from app.routers.users import router as users_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

logger = logging.getLogger("trusthire")

# Database table creation
Base.metadata.create_all(bind=engine)

# FastAPI application
app = FastAPI(
    title="TrustHire AI",
    description="AI-powered cybersecurity-focused freelance hiring platform",
    version="1.0.0",
)

# Home and health endpoints
@app.get("/")
def root():
    return {"message": "TrustHire AI API is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


# Single CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL.rstrip("/"),
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routers
app.include_router(auth_router)
app.include_router(jobs_router)
app.include_router(proposals_router)
app.include_router(users_router)
app.include_router(risk_router)
app.include_router(reviews_router)
app.include_router(payments_router)

logger.info("TrustHire AI backend starting")
