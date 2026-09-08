from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.job import Job
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse

router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)


# =========================================================
# CREATE REVIEW - CLIENT ONLY
# =========================================================

@router.post("/", response_model=ReviewResponse)
def create_review(
    review: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "client":
        raise HTTPException(
            status_code=403,
            detail="Only clients can create reviews"
        )

    job = db.query(Job).filter(
        Job.id == review.job_id
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    if job.client_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only review your own jobs"
        )

    if job.status != "completed":
        raise HTTPException(
            status_code=400,
            detail="You can review only completed jobs"
        )

    if job.freelancer_id != review.freelancer_id:
        raise HTTPException(
            status_code=400,
            detail="Freelancer is not assigned to this job"
        )

    existing_review = db.query(Review).filter(
        Review.job_id == review.job_id
    ).first()

    if existing_review:
        raise HTTPException(
            status_code=400,
            detail="This job has already been reviewed"
        )

    new_review = Review(
        reviewer_id=current_user.id,
        freelancer_id=review.freelancer_id,
        job_id=review.job_id,
        rating=review.rating,
        comment=review.comment
    )

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return new_review


# =========================================================
# GET REVIEWS FOR FREELANCER
# =========================================================

@router.get("/freelancer/{freelancer_id}")
def get_freelancer_reviews(
    freelancer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    reviews = db.query(Review).filter(
        Review.freelancer_id == freelancer_id
    ).all()

    return reviews