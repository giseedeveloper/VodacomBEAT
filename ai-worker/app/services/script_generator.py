"""Script generation orchestration."""

from __future__ import annotations

import logging

from app.config import DEFAULT_LANGUAGE, MAX_DURATION_SECONDS
from app.schemas.script import ScriptGenerateRequest, ScriptGenerateResponse, ScriptPayload
from app.services.llm_client import LlmClient
from app.services.validator import estimate_duration_seconds, validate_script

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You write short Vodacom caller-tune scripts for Tanzanian businesses.
Return JSON only with keys:
- plain_text: the final spoken script in Swahili (sw-TZ), max ~30 seconds when read aloud
- tone: one word describing tone
- pronunciation_hints: array of {word, hint} for tricky brand/location names
- warnings: array of strings for anything the business should review
- versions: array with one object {label, text} offering an alternate shorter variant

Rules:
- Include the business name, location (if provided), and call-to-action (if provided)
- No unapproved phone numbers, no guaranteed/free claims
- Keep it professional and suitable for a mobile network caller tune
"""


def _fallback_script(request: ScriptGenerateRequest) -> ScriptPayload:
    location = request.business_location or "Dar es Salaam"
    cta = request.call_to_action or "Tembelea duka letu leo"
    plain_text = (
        f"Karibu {request.business_name}, {location}. "
        f"Tunakupa huduma bora kwa wateja wetu. {cta}."
    )
    duration = estimate_duration_seconds(plain_text)
    return ScriptPayload(
        plain_text=plain_text,
        language=request.language or DEFAULT_LANGUAGE,
        tone="professional",
        estimated_duration_seconds=duration,
        pronunciation_hints=[],
        warnings=["Generated using offline fallback template — configure BEAT_LLM_API_KEY for AI scripts"],
        versions=[{"label": "short", "text": plain_text}],
    )


def generate_script(request: ScriptGenerateRequest) -> ScriptGenerateResponse:
    request.max_duration_seconds = request.max_duration_seconds or MAX_DURATION_SECONDS
    llm = LlmClient()

    try:
        if llm.is_configured():
            raw = llm.generate_json(
                SYSTEM_PROMPT,
                (
                    f"Business: {request.business_name}\n"
                    f"Location: {request.business_location or 'not provided'}\n"
                    f"Industry: {request.business_industry or 'general'}\n"
                    f"Call to action: {request.call_to_action or 'visit us today'}\n"
                    f"Voice type: {request.voice_type or 'neutral'}\n"
                    f"Language: {request.language}\n"
                    f"Max duration seconds: {request.max_duration_seconds}"
                ),
            )
            plain_text = str(raw.get("plain_text", "")).strip()
            duration = estimate_duration_seconds(plain_text)
            payload = ScriptPayload(
                plain_text=plain_text,
                language=request.language,
                tone=str(raw.get("tone", "professional")),
                estimated_duration_seconds=duration,
                pronunciation_hints=raw.get("pronunciation_hints", []) or [],
                warnings=raw.get("warnings", []) or [],
                versions=raw.get("versions", []) or [],
            )
        else:
            logger.warning("LLM not configured — using fallback template for subscription %s", request.subscription_id)
            payload = _fallback_script(request)
    except Exception as exc:
        logger.exception("script generation failed for subscription %s", request.subscription_id)
        return ScriptGenerateResponse(success=False, message=str(exc))

    validation_errors = validate_script(payload, request)
    return ScriptGenerateResponse(
        success=True,
        message="Script generated",
        script=payload,
        validation_errors=validation_errors,
    )
