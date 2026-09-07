from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_user


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# =========================================================
# GET CURRENT USER TRUST SCORE
# =========================================================

@router.get("/trust-score")
def get_trust_score(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    score = current_user.trust_score

    if score >= 80:
        level = "High"
    elif score >= 60:
        level = "Medium"
    else:
        level = "Low"

    return {
        "user_id": current_user.id,
        "trust_score": score,
        "trust_level": level
    }