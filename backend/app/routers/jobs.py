from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.job import Job
from app.models.user import User
from app.schemas.job import JobCreate, JobResponse

router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"]
)


# =========================================================
# CREATE JOB - CLIENT ONLY
# =========================================================

@router.post("/", response_model=JobResponse)
def create_job(
    job: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "client":
        raise HTTPException(
            status_code=403,
            detail="Only clients can create jobs"
        )

    new_job = Job(
        client_id=current_user.id,
        freelancer_id=None,
        title=job.title,
        description=job.description,
        budget=job.budget,
        status="open"
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return new_job


# =========================================================
# GET OPEN JOBS - FREELANCER ONLY
# =========================================================

@router.get("/", response_model=list[JobResponse])
def get_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "freelancer":
        raise HTTPException(
            status_code=403,
            detail="Only freelancers can view available jobs"
        )

    jobs = db.query(Job).filter(
        Job.status == "open"
    ).all()

    return jobs


# =========================================================
# GET CLIENT'S OWN JOBS
# =========================================================

@router.get(
    "/client/{client_id}",
    response_model=list[JobResponse]
)
def get_client_jobs(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "client":
        raise HTTPException(
            status_code=403,
            detail="Only clients can view their jobs"
        )

    if current_user.id != client_id:
        raise HTTPException(
            status_code=403,
            detail="You can only view your own jobs"
        )

    jobs = db.query(Job).filter(
        Job.client_id == current_user.id
    ).all()

    return jobs


# =========================================================
# COMPLETE JOB - CLIENT ONLY
# =========================================================

@router.put("/{job_id}/complete")
def complete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "client":
        raise HTTPException(
            status_code=403,
            detail="Only clients can complete jobs"
        )

    job = db.query(Job).filter(
        Job.id == job_id
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    if job.client_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only complete your own jobs"
        )

    if job.status != "assigned":
        raise HTTPException(
            status_code=400,
            detail="Only assigned jobs can be completed"
        )

    # =====================================================
    # UPDATE JOB STATUS
    # =====================================================

    job.status = "completed"

    # =====================================================
    # UPDATE FREELANCER TRUST SCORE
    # =====================================================

    if job.freelancer_id is not None:

        freelancer = db.query(User).filter(
            User.id == job.freelancer_id
        ).first()

        if freelancer:

            freelancer.trust_score = min(
                freelancer.trust_score + 10,
                100
            )

    db.commit()
    db.refresh(job)

    return {
        "message": "Job completed successfully",
        "job_id": job.id,
        "status": job.status,
        "freelancer_id": job.freelancer_id
    }