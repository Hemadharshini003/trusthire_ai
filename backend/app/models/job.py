from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    budget = Column(Integer, nullable=False)
    status = Column(String(30), default="open", nullable=False)