
from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    UniqueConstraint,
)
from sqlalchemy.sql import func

from app.database import Base


class Payment(Base):
    __tablename__ = "payments"

    __table_args__ = (
        UniqueConstraint(
            "job_id",
            name="uq_payment_job",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    job_id = Column(
        Integer,
        ForeignKey("jobs.id"),
        nullable=False,
    )

    client_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    freelancer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    amount = Column(Integer, nullable=False)

    status = Column(
        String(20),
        default="pending",
        nullable=False,
    )

    payment_reference = Column(
        String(64),
        unique=True,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
