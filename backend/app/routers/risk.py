from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.job import Job
from app.models.proposal import Proposal
from app.models.user import User
from app.dependencies import get_current_user

from app.services.risk_engine import (
    analyze_job_risk,
    analyze_proposal_risk
)


router = APIRouter(
    prefix="/risk",
    tags=["AI Cyber Risk"]
)


# =========================================================
# ANALYZE JOB
# =========================================================

@router.get("/job/{job_id}")
def analyze_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    job = db.query(Job).filter(
        Job.id == job_id
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    result = analyze_job_risk(
        title=job.title,
        description=job.description,
        budget=job.budget
    )

    return {
        "job_id": job.id,
        "title": job.title,
        **result
    }


# =========================================================
# ANALYZE PROPOSAL
# =========================================================

@router.get("/proposal/{proposal_id}")
def analyze_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "client":
        raise HTTPException(
            status_code=403,
            detail="Only clients can analyze proposals"
        )

    proposal = db.query(Proposal).filter(
        Proposal.id == proposal_id
    ).first()

    if not proposal:
        raise HTTPException(
            status_code=404,
            detail="Proposal not found"
        )

    job = db.query(Job).filter(
        Job.id == proposal.job_id
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Related job not found"
        )

    # -----------------------------------------------------
    # Security check
    # -----------------------------------------------------

    if job.client_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only analyze proposals for your own jobs"
        )

    result = analyze_proposal_risk(
        cover_letter=proposal.cover_letter,
        proposed_budget=proposal.proposed_budget
    )

    return {
        "proposal_id": proposal.id,
        "job_id": proposal.job_id,
        "freelancer_id": proposal.freelancer_id,
        **result
    }