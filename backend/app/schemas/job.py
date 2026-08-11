from pydantic import BaseModel


class JobCreate(BaseModel):
    client_id: int
    title: str
    description: str
    budget: int


class JobResponse(BaseModel):
    id: int
    client_id: int
    title: str
    description: str
    budget: int
    status: str

    class Config:
        from_attributes = True