
import secrets

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.job import Job
from app.models.payment import Payment
from app.models.proposal import Proposal
from app.models.user import User

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/jobs/{job_id}")
def create_payment(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Only clients can initiate payments.
    if current_user.role != "client":
        raise HTTPException(
            status_code=403,
            detail="Only clients can initiate payments",
        )

    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Prevent paying for another client's job.
    if job.client_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only pay for your own jobs",
        )

    if job.status not in ("assigned", "completed"):
        raise HTTPException(
            status_code=400,
            detail="Payment requires an assigned freelancer",
        )

    if not job.freelancer_id:
        raise HTTPException(
            status_code=400,
            detail="No freelancer is assigned to this job",
        )

    # Amount must come from the accepted proposal, not the request.
    proposal = (
        db.query(Proposal)
        .filter(
            Proposal.job_id == job.id,
            Proposal.freelancer_id == job.freelancer_id,
            Proposal.status == "accepted",
        )
        .first()
    )

    if not proposal or proposal.proposed_budget <= 0:
        raise HTTPException(
            status_code=400,
            detail="No valid accepted proposal was found",
        )

    existing = (
        db.query(Payment)
        .filter(Payment.job_id == job.id)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="A payment record already exists for this job",
        )

    payment = Payment(
        job_id=job.id,
        client_id=job.client_id,
        freelancer_id=job.freelancer_id,
        amount=proposal.proposed_budget,
        status="pending",
        payment_reference="TH-" + secrets.token_hex(12).upper(),
    )

    db.add(payment)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="A payment record already exists for this job",
        )

    db.refresh(payment)

    return {
        "message": "Demo payment record created",
        "payment_id": payment.id,
        "reference": payment.payment_reference,
        "job_id": payment.job_id,
        "amount": payment.amount,
        "status": payment.status,
        "mode": "DEMO",
    }


@router.get("/my")
def get_my_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Each user can see only payments they participate in.
    if current_user.role == "client":
        query = db.query(Payment).filter(
            Payment.client_id == current_user.id
        )
    elif current_user.role == "freelancer":
        query = db.query(Payment).filter(
            Payment.freelancer_id == current_user.id
        )
    else:
        raise HTTPException(status_code=403, detail="Unauthorized role")

    return [
        {
            "payment_id": payment.id,
            "job_id": payment.job_id,
            "amount": payment.amount,
            "status": payment.status,
            "reference": payment.payment_reference,
            "mode": "DEMO",
        }
        for payment in query.order_by(Payment.id.desc()).all()
    ]


@router.post("/{payment_id}/demo-confirm")
def demo_confirm_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # This endpoint simulates a result for the review only.
    if current_user.role != "client":
        raise HTTPException(
            status_code=403,
            detail="Only the client can run the payment demo",
        )

    payment = db.query(Payment).filter(
        Payment.id == payment_id
    ).first()

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found",
        )

    if payment.client_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You cannot manage this payment",
        )

    if payment.status != "pending":
        raise HTTPException(
            status_code=400,
            detail="This payment has already been processed",
        )

    payment.status = "demo_paid"
    db.commit()
    db.refresh(payment)

    return {
        "message": "Demo confirmation recorded; no real money was transferred",
        "payment_id": payment.id,
        "status": payment.status,
        "mode": "DEMO",
    }
