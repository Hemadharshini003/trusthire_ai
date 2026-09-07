from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from jose import jwt

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserRegister
from app.config import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter()

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# =========================
# LOGIN SCHEMA
# =========================

class UserLogin(BaseModel):
    email: EmailStr
    password: str


# =========================
# REGISTER
# =========================

@router.post("/register")
def register(
    user: UserRegister,
    db: Session = Depends(get_db)
):

    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = pwd_context.hash(
        user.password
    )

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password=hashed_password,
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": new_user.id,
        "role": new_user.role
    }


# =========================
# LOGIN
# =========================

@router.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    # User not found
    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Password check
    try:
        password_valid = pwd_context.verify(
            user.password,
            existing_user.password
        )
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Unable to verify password. Please register again."
        )

    if not password_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # =========================
    # CREATE JWT
    # =========================

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    token_data = {
        "sub": str(existing_user.id),
        "role": existing_user.role,
        "exp": expire
    }

    access_token = jwt.encode(
        token_data,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    # =========================
    # RESPONSE
    # =========================

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": existing_user.id,
        "role": existing_user.role
    }