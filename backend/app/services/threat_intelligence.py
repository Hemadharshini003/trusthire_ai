import os
import time

import requests
from dotenv import load_dotenv

load_dotenv()

VIRUSTOTAL_API_KEY = os.getenv("VIRUSTOTAL_API_KEY")
VIRUSTOTAL_BASE_URL = "https://www.virustotal.com/api/v3"


def check_url_reputation(url: str):
    if not VIRUSTOTAL_API_KEY:
        return {
            "available": False,
            "message": "VirusTotal API key is not configured"
        }

    headers = {
        "x-apikey": VIRUSTOTAL_API_KEY
    }

    try:
        # Submit URL for analysis
        response = requests.post(
            f"{VIRUSTOTAL_BASE_URL}/urls",
            headers=headers,
            data={"url": url},
            timeout=10
        )

        if response.status_code != 200:
            return {
                "available": False,
                "message": "VirusTotal URL submission failed",
                "status_code": response.status_code
            }

        analysis_id = response.json()["data"]["id"]

        # Get analysis result
        for _ in range(5):
            analysis_response = requests.get(
                f"{VIRUSTOTAL_BASE_URL}/analyses/{analysis_id}",
                headers=headers,
                timeout=10
            )

            if analysis_response.status_code != 200:
                return {
                    "available": False,
                    "message": "Unable to retrieve VirusTotal analysis"
                }

            analysis_data = analysis_response.json()["data"]
            attributes = analysis_data["attributes"]

            if attributes["status"] == "completed":
                stats = attributes.get("stats", {})

                malicious = stats.get("malicious", 0)
                suspicious = stats.get("suspicious", 0)
                harmless = stats.get("harmless", 0)

                if malicious > 0:
                    risk_level = "HIGH"
                elif suspicious > 0:
                    risk_level = "MEDIUM"
                else:
                    risk_level = "LOW"

                return {
                    "available": True,
                    "status": "completed",
                    "risk_level": risk_level,
                    "malicious": malicious,
                    "suspicious": suspicious,
                    "harmless": harmless
                }

            time.sleep(2)

        return {
            "available": True,
            "status": "pending",
            "message": "VirusTotal analysis is still processing"
        }

    except requests.RequestException:
        return {
            "available": False,
            "message": "VirusTotal service unavailable"
        }