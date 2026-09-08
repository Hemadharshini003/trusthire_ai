from sqlalchemy import Column, ForeignKey, Integer, Text

from app.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)

    reviewer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

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

    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)