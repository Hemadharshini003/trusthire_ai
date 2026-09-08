from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    freelancer_id: int
    job_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = None


class ReviewResponse(BaseModel):
    id: int
    reviewer_id: int
    freelancer_id: int
    job_id: int
    rating: int
    comment: str | None

    class Config:
        from_attributes = True