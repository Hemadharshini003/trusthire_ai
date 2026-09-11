from pydantic import BaseModel, ConfigDict


class ProposalCreate(BaseModel):
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

    model_config = ConfigDict(from_attributes=True)