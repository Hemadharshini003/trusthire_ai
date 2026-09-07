# =========================================================
# TRUSTHIRE AI - CYBER RISK ENGINE
# =========================================================


SUSPICIOUS_KEYWORDS = [
    "urgent",
    "immediately",
    "asap",
    "quick money",
    "guaranteed",
    "password",
    "otp",
    "verification code",
    "bank account",
    "credit card",
    "crypto",
    "cryptocurrency",
    "wallet",
    "payment",
    "transfer money",
    "login credentials",
    "remote access",
    "wire transfer",
]


HIGH_RISK_KEYWORDS = [
    "otp",
    "password",
    "login credentials",
    "bank account",
    "credit card",
    "remote access",
    "transfer money",
]


def analyze_job_risk(
    title: str,
    description: str,
    budget: int
):
    text = f"{title} {description}".lower()

    score = 0
    reasons = []

    # -----------------------------------------------------
    # Suspicious keyword detection
    # -----------------------------------------------------

    found_keywords = []

    for keyword in SUSPICIOUS_KEYWORDS:
        if keyword in text:
            found_keywords.append(keyword)

    if found_keywords:
        score += min(len(found_keywords) * 8, 40)

        reasons.append(
            "Suspicious keywords detected: "
            + ", ".join(found_keywords[:5])
        )

    # -----------------------------------------------------
    # High-risk credential/payment detection
    # -----------------------------------------------------

    high_risk_found = []

    for keyword in HIGH_RISK_KEYWORDS:
        if keyword in text:
            high_risk_found.append(keyword)

    if high_risk_found:
        score += 30

        reasons.append(
            "Sensitive credential or financial activity detected"
        )

    # -----------------------------------------------------
    # Urgency detection
    # -----------------------------------------------------

    urgency_words = [
        "urgent",
        "immediately",
        "asap",
        "within hours",
        "today"
    ]

    urgency_found = any(
        word in text
        for word in urgency_words
    )

    if urgency_found:
        score += 10
        reasons.append(
            "High-pressure or urgent language detected"
        )

    # -----------------------------------------------------
    # Budget analysis
    # -----------------------------------------------------

    if budget <= 1000:
        score += 10
        reasons.append(
            "Very low budget may indicate suspicious or unrealistic offer"
        )

    # -----------------------------------------------------
    # Description length
    # -----------------------------------------------------

    if len(description.strip()) < 30:
        score += 5
        reasons.append(
            "Job description contains very limited information"
        )

    # -----------------------------------------------------
    # Limit score
    # -----------------------------------------------------

    score = min(score, 100)

    # -----------------------------------------------------
    # Risk level
    # -----------------------------------------------------

    if score >= 70:
        risk_level = "HIGH"
    elif score >= 40:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    if not reasons:
        reasons.append(
            "No major suspicious patterns detected"
        )

    return {
        "risk_score": score,
        "risk_level": risk_level,
        "reasons": reasons
    }


def analyze_proposal_risk(
    cover_letter: str,
    proposed_budget: int
):
    text = cover_letter.lower()

    score = 0
    reasons = []

    # -----------------------------------------------------
    # Suspicious proposal keywords
    # -----------------------------------------------------

    found_keywords = []

    for keyword in SUSPICIOUS_KEYWORDS:
        if keyword in text:
            found_keywords.append(keyword)

    if found_keywords:
        score += min(
            len(found_keywords) * 10,
            40
        )

        reasons.append(
            "Suspicious proposal keywords detected: "
            + ", ".join(found_keywords[:5])
        )

    # -----------------------------------------------------
    # Credential/payment related content
    # -----------------------------------------------------

    high_risk_found = []

    for keyword in HIGH_RISK_KEYWORDS:
        if keyword in text:
            high_risk_found.append(keyword)

    if high_risk_found:
        score += 30

        reasons.append(
            "Proposal contains sensitive credential or financial terms"
        )

    # -----------------------------------------------------
    # Very low proposal budget
    # -----------------------------------------------------

    if proposed_budget <= 1000:
        score += 10

        reasons.append(
            "Unusually low proposed budget detected"
        )

    # -----------------------------------------------------
    # Very short proposal
    # -----------------------------------------------------

    if len(cover_letter.strip()) < 30:
        score += 10

        reasons.append(
            "Proposal contains very limited information"
        )

    # -----------------------------------------------------
    # Limit score
    # -----------------------------------------------------

    score = min(score, 100)

    if score >= 70:
        risk_level = "HIGH"
    elif score >= 40:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    if not reasons:
        reasons.append(
            "No major suspicious patterns detected"
        )

    return {
        "risk_score": score,
        "risk_level": risk_level,
        "reasons": reasons
    }