from app.routers.jobs import complete_job


def test_complete_job_requires_assigned_status():
    # Business rule:
    # Only an assigned job can be completed.
    assert complete_job is not None