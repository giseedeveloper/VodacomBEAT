"""Server-side script validation (business rules enforced here, not by the LLM)."""

from __future__ import annotations

import re

from app.schemas.script import ScriptGenerateRequest, ScriptPayload


def estimate_duration_seconds(text: str) -> int:
    words = len(re.findall(r"\w+", text))
    # Swahili caller-tune pace ~2.5 words/sec with pauses
    return max(5, min(60, int(words / 2.5)))


def validate_script(payload: ScriptPayload, request: ScriptGenerateRequest) -> list[str]:
    errors: list[str] = []
    text = payload.plain_text.strip()
    lower = text.lower()

    if not text:
        errors.append("Script text is empty")
        return errors

    if request.business_name.lower() not in lower:
        errors.append("Business name must appear in the script")

    if request.business_location and request.business_location.lower() not in lower:
        errors.append("Business location must appear in the script")

    if request.call_to_action and request.call_to_action.lower() not in lower:
        errors.append("Call-to-action must appear in the script")

    duration = payload.estimated_duration_seconds or estimate_duration_seconds(text)
    if duration > request.max_duration_seconds:
        errors.append(
            f"Estimated duration {duration}s exceeds limit of {request.max_duration_seconds}s"
        )

    for claim in request.forbidden_claims:
        if claim.lower() in lower:
            errors.append(f"Forbidden claim detected: {claim}")

    if re.search(r"\b\d{10,}\b", text):
        errors.append("Unapproved phone numbers are not allowed in the script")

    return errors
