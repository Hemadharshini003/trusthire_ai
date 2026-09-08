from app.services.risk_engine import analyze_job_risk, analyze_proposal_risk


def test_low_risk_job():
    result = analyze_job_risk(
        title="Build a portfolio website",
        description="Create a simple responsive portfolio website using React and CSS.",
        budget=5000
    )

    assert result["risk_level"] == "LOW"
    assert 0 <= result["risk_score"] <= 100


def test_high_risk_job():
    result = analyze_job_risk(
        title="Urgent account verification",
        description="Need your password and bank account credentials immediately.",
        budget=500
    )

    assert result["risk_level"] == "HIGH"
    assert result["risk_score"] >= 70


def test_medium_risk_job():
    result = analyze_job_risk(
        title="Urgent website task",
        description="Need a quick website development task completed.",
        budget=1500
    )

    assert 0 <= result["risk_score"] <= 100


def test_proposal_risk():
    result = analyze_proposal_risk(
        cover_letter="I can complete this project quickly and professionally.",
        proposed_budget=5000
    )

    assert "risk_score" in result
    assert "risk_level" in result
    assert "reasons" in result
    assert 0 <= result["risk_score"] <= 100


def test_suspicious_proposal():
    result = analyze_proposal_risk(
        cover_letter="Send password and payment details urgently.",
        proposed_budget=500
    )

    assert result["risk_score"] >= 40