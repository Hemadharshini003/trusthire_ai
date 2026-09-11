from sqlalchemy import Column, ForeignKey, Integer, String, Text

from app.database import Base


class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True, index=True)

    freelancer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    job_id = Column(
        Integer,
        ForeignKey("jobs.id"),
        nullable=False
    )

    cover_letter = Column(Text, nullable=False)
    proposed_budget = Column(Integer, nullable=False)
    status = Column(String(30), default="pending", nullable=False)