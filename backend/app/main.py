from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models.user import User
from app.models.job import Job
from app.models.proposal import Proposal

from app.routers.auth import router as auth_router
from app.routers.jobs import router as jobs_router
from app.routers.proposals import router as proposals_router


Base.metadata.create_all(bind=engine)

app = FastAPI(title="TrustHire AI")


# Routers
app.include_router(auth_router)
app.include_router(jobs_router)
app.include_router(proposals_router)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "TrustHire AI Backend Running 🚀"}