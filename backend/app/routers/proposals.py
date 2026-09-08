from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.job import Job
from app.models.proposal import Proposal
from app.models.user import User
from app.schemas.proposal import ProposalCreate, ProposalResponse

router = APIRouter(
    prefix="/proposals",
    tags=["Proposals"]
)


# =========================================================
# CREATE PROPOSAL - FREELANCER ONLY
# =========================================================

@router.post("/", response_model=ProposalResponse)
def create_proposal(
    proposal: ProposalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "freelancer":
        raise HTTPException(
            status_code=403,
            detail="Only freelancers can submit proposals"
        )

    job = db.query(Job).filter(
        Job.id == proposal.job_id
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    if job.status != "open":
        raise HTTPException(
            status_code=400,
            detail="Proposals can only be submitted for open jobs"
        )

    existing_proposal = db.query(Proposal).filter(
        Proposal.job_id == proposal.job_id,
        Proposal.freelancer_id == current_user.id
    ).first()

    if existing_proposal:
        raise HTTPException(
            status_code=400,
            detail="You have already submitted a proposal for this job"
        )

    new_proposal = Proposal(
        freelancer_id=current_user.id,
        job_id=proposal.job_id,
        cover_letter=proposal.cover_letter,
        proposed_budget=proposal.proposed_budget,
        status="pending"
    )

    db.add(new_proposal)
    db.commit()
    db.refresh(new_proposal)

    return new_proposal


# =========================================================
# GET PROPOSALS
# =========================================================

@router.get("/", response_model=list[ProposalResponse])
def get_proposals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role == "freelancer":

        return db.query(Proposal).filter(
            Proposal.freelancer_id == current_user.id
        ).all()

    if current_user.role == "client":

        proposals = (
            db.query(Proposal)
            .join(Job, Proposal.job_id == Job.id)
            .filter(Job.client_id == current_user.id)
            .all()
        )

        return proposals

    raise HTTPException(
        status_code=403,
        detail="Unauthorized role"
    )


# =========================================================
# ACCEPT / REJECT PROPOSAL - CLIENT ONLY
# =========================================================

@router.put("/{proposal_id}/{action}")
def update_proposal_status(
    proposal_id: int,
    action: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "client":
        raise HTTPException(
            status_code=403,
            detail="Only clients can accept or reject proposals"
        )

    proposal = db.query(Proposal).filter(
        Proposal.id == proposal_id
    ).first()

    if not proposal:
        raise HTTPException(
            status_code=404,
            detail="Proposal not found"
        )

    if action not in ["accept", "reject"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid action. Use accept or reject."
        )

    if proposal.status != "pending":
        raise HTTPException(
            status_code=400,
            detail="Proposal has already been processed."
        )

    job = db.query(Job).filter(
        Job.id == proposal.job_id
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Related job not found"
        )

    # Client can only manage proposals for own jobs
    if job.client_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only manage proposals for your own jobs"
        )

    # =====================================================
    # ACCEPT
    # =====================================================

    if action == "accept":

        if job.status != "open":
            raise HTTPException(
                status_code=400,
                detail="This job is no longer open"
            )

        proposal.status = "accepted"

        # Store selected freelancer in job
        job.freelancer_id = proposal.freelancer_id

        # Job becomes assigned
        job.status = "assigned"

        # Reject other pending proposals
        other_proposals = db.query(Proposal).filter(
            Proposal.job_id == proposal.job_id,
            Proposal.id != proposal.id,
            Proposal.status == "pending"
        ).all()

        for other in other_proposals:
            other.status = "rejected"

        db.commit()
        db.refresh(proposal)
        db.refresh(job)

        return {
            "message": "Proposal accepted successfully",
            "proposal_id": proposal.id,
            "status": proposal.status,
            "job_id": job.id,
            "job_status": job.status,
            "freelancer_id": job.freelancer_id
        }

    # =====================================================
    # REJECT
    # =====================================================

    proposal.status = "rejected"

    db.commit()
    db.refresh(proposal)

    return {
        "message": "Proposal rejected successfully",
        "proposal_id": proposal.id,
        "status": proposal.status,
        "job_id": job.id,
        "job_status": job.status
    }