from pydantic import BaseModel, ConfigDict, Field


class JobCreate(BaseModel):
    title: str
    description: str
    budget: int = Field(..., gt=0)


class JobResponse(BaseModel):
    id: int
    client_id: int
    freelancer_id: int | None
    title: str
    description: str
    budget: int
    status: str

    model_config = ConfigDict(from_attributes=True)