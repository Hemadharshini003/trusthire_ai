from fastapi import FastAPI
from app.database import Base, engine
from app.models.user import User
from app.routers.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TrustHire AI")
app.include_router(auth_router)
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