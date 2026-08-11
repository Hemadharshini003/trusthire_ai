from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.proposal import Proposal
from app.schemas.proposal import ProposalCreate, ProposalResponse


router = APIRouter(
    prefix="/proposals",
    tags=["Proposals"]
)


@router.post("/", response_model=ProposalResponse)
def create_proposal(
    proposal: ProposalCreate,
    db: Session = Depends(get_db)
):
    new_proposal = Proposal(
        freelancer_id=proposal.freelancer_id,
        job_id=proposal.job_id,
        cover_letter=proposal.cover_letter,
        proposed_budget=proposal.proposed_budget,
        status="pending"
    )

    db.add(new_proposal)
    db.commit()
    db.refresh(new_proposal)

    return new_proposal


@router.get("/", response_model=list[ProposalResponse])
def get_proposals(
    db: Session = Depends(get_db)
):
    proposals = db.query(Proposal).all()
    return proposals