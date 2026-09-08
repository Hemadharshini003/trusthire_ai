from sqlalchemy import Column, ForeignKey, Integer, String, Text

from app.database import Base


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)

    job_id = Column(
        Integer,
        ForeignKey("jobs.id"),
        nullable=False
    )

    risk_score = Column(Integer, nullable=False)

    risk_level = Column(
        String(20),
        nullable=False
    )

    explanation = Column(
        Text,
        nullable=True
    )