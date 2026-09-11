from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.job import Job
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("/", response_model=ReviewResponse)
def create_review(
    review: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "client":
        raise HTTPException(
            status_code=403,
            detail="Only clients can create reviews",
        )

    job = db.query(Job).filter(Job.id == review.job_id).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    if job.client_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only review your own jobs",
        )

    if job.status != "completed":
        raise HTTPException(
            status_code=400,
            detail="You can review only completed jobs",
        )

    if job.freelancer_id != review.freelancer_id:
        raise HTTPException(
            status_code=400,
            detail="Freelancer is not assigned to this job",
        )

    freelancer = db.query(User).filter(
        User.id == review.freelancer_id
    ).first()

    if not freelancer:
        raise HTTPException(
            status_code=404,
            detail="Freelancer not found",
        )

    existing_review = db.query(Review).filter(
        Review.job_id == review.job_id
    ).first()

    if existing_review:
        raise HTTPException(
            status_code=400,
            detail="This job has already been reviewed",
        )

    new_review = Review(
        reviewer_id=current_user.id,
        freelancer_id=review.freelancer_id,
        job_id=review.job_id,
        rating=review.rating,
        comment=review.comment,
    )

    db.add(new_review)

    score_change = (review.rating - 3) * 5

    freelancer.trust_score = max(
        0,
        min(100, freelancer.trust_score + score_change),
    )

    db.commit()
    db.refresh(new_review)
    db.refresh(freelancer)

    return new_review


@router.get(
    "/freelancer/{freelancer_id}",
    response_model=list[ReviewResponse],
)
def get_freelancer_reviews(
    freelancer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    freelancer = db.query(User).filter(
        User.id == freelancer_id,
        User.role == "freelancer",
    ).first()

    if not freelancer:
        raise HTTPException(
            status_code=404,
            detail="Freelancer not found",
        )

    return db.query(Review).filter(
        Review.freelancer_id == freelancer_id
    ).all()