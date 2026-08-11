from pydantic import BaseModel


class ProposalCreate(BaseModel):
    freelancer_id: int
    job_id: int
    cover_letter: str
    proposed_budget: int


class ProposalResponse(BaseModel):
    id: int
    freelancer_id: int
    job_id: int
    cover_letter: str
    proposed_budget: int
    status: str

    class Config:
        from_attributes = True