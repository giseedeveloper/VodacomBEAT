"""Template-guided script generation (3 variants). Backend owns template choice."""

from __future__ import annotations

import logging
import re

from app.config import DEFAULT_LANGUAGE, MAX_DURATION_SECONDS
from app.schemas.script import ScriptGenerateRequest, ScriptGenerateResponse, ScriptPayload
from app.services.gemini_client import GeminiClient
from app.services.llm_client import LlmClient
from app.services.validator import estimate_duration_seconds, validate_script

logger = logging.getLogger(__name__)

SCRIPT_JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "plain_text": {"type": "string"},
        "tone": {"type": "string"},
        "pronunciation_hints": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"word": {"type": "string"}, "hint": {"type": "string"}},
                "required": ["word", "hint"],
            },
        },
        "warnings": {"type": "array", "items": {"type": "string"}},
        "versions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "variant": {
                        "type": "string",
                        "enum": ["SHORT_DIRECT", "FRIENDLY_PROMOTIONAL", "PROFESSIONAL"],
                    },
                    "label": {"type": "string"},
                    "text": {"type": "string"},
                },
                "required": ["variant", "text"],
            },
        },
    },
    "required": ["plain_text", "tone", "versions"],
}


def count_words(text: str) -> int:
    return len([part for part in re.split(r"\s+", text.strip()) if part])


def generate_script(request: ScriptGenerateRequest) -> ScriptGenerateResponse:
    request.max_duration_seconds = request.max_duration_seconds or MAX_DURATION_SECONDS
    template = request.template
    maximum_words = request.maximum_words or (template.maximum_words if template else 75)

    try:
        raw = _generate_raw(request, maximum_words)
        versions = _normalize_versions(raw.get("versions") or [], request, maximum_words)
        plain_text = str(raw.get("plain_text") or "").strip()
        if not plain_text and versions:
            plain_text = versions[0]["text"]

        duration = estimate_duration_seconds(plain_text)
        payload = ScriptPayload(
            plain_text=plain_text,
            language=request.language or DEFAULT_LANGUAGE,
            tone=str(raw.get("tone") or request.tone or "FRIENDLY_SALES"),
            estimated_duration_seconds=duration,
            pronunciation_hints=raw.get("pronunciation_hints", []) or [],
            warnings=raw.get("warnings", []) or [],
            versions=versions,
        )
    except Exception as exc:
        logger.exception("script generation failed for subscription %s", request.subscription_id)
        return ScriptGenerateResponse(success=False, message=str(exc))

    validation_errors = validate_script(payload, request)
    for version in payload.versions:
        word_count = count_words(str(version.get("text", "")))
        version["word_count"] = word_count
        if word_count > maximum_words:
            validation_errors.append(
                f"Variant {version.get('variant')} exceeds {maximum_words} words ({word_count})"
            )

    return ScriptGenerateResponse(
        success=True,
        message="Script generated",
        script=payload,
        validation_errors=list(dict.fromkeys(validation_errors)),
    )


def _generate_raw(request: ScriptGenerateRequest, maximum_words: int) -> dict:
    system_prompt, user_prompt = _build_prompts(request, maximum_words)
    gemini = GeminiClient()
    if gemini.is_configured():
        try:
            combined = f"{system_prompt}\n\n{user_prompt}"
            raw, _usage = gemini.generate_structured(combined, SCRIPT_JSON_SCHEMA, temperature=0.55)
            return raw
        except Exception as exc:
            logger.warning("Gemini structured generate failed, trying LLM/fallback: %s", exc)

    llm = LlmClient()
    if llm.is_configured():
        try:
            return llm.generate_json(system_prompt, user_prompt)
        except Exception as exc:
            logger.warning("LLM generate failed, using offline fallback: %s", exc)

    logger.warning("No working Gemini/LLM — using structured fallback for %s", request.subscription_id)
    return _fallback_raw(request)


def _build_prompts(request: ScriptGenerateRequest, maximum_words: int) -> tuple[str, str]:
    template = request.template
    instructions = (template.prompt_instructions if template else None) or (
        "Write Tanzanian Kiswahili caller-tune scripts. Short TTS-friendly sentences."
    )
    system_prompt = f"""{instructions}

Return JSON only with keys:
- plain_text: default recommended script (usually FRIENDLY_PROMOTIONAL)
- tone: tone enum/string used
- pronunciation_hints: array of {{word, hint}}
- warnings: array of strings
- versions: exactly 3 objects with variant in [SHORT_DIRECT, FRIENDLY_PROMOTIONAL, PROFESSIONAL] and text

Hard rules:
- Never invent prices, offers, products, phone numbers or locations.
- Never include MSISDN / payment details / phone numbers in the script.
- Prefer "aina mbalimbali" over unsupported "aina zote".
- Target {maximum_words - 15} to {maximum_words} words per variant (NOT tiny 1–2 sentence ads).
- SHORT_DIRECT may be slightly shorter, but still at least ~40 words.
- FRIENDLY_PROMOTIONAL is the richest (welcome → products → location → CTA → name reprise).
- PROFESSIONAL is clear and complete, not terse.
- Preserve business name spelling exactly.
- Use Tanzanian Kiswahili suitable for TTS with natural commas/pauses.
"""

    products = ", ".join(request.products_or_services or []) or "not provided"
    secondary = ", ".join(request.secondary_products or []) or "not provided"
    selling = ", ".join(request.selling_points or []) or "not provided"
    must_include = ", ".join(request.must_include_words or []) or "none"
    must_exclude = ", ".join(request.must_exclude_words or []) or "none"
    opening = "; ".join((template.opening_rules if template else []) or [])
    body = "; ".join((template.body_rules if template else []) or [])
    cta_rules = "; ".join((template.cta_rules if template else []) or [])

    user_prompt = f"""
Validated business data:
- Business name: {request.business_name}
- Description: {request.business_description or request.business_industry or 'n/a'}
- Category: {request.category or 'n/a'}
- Objective: {request.objective or 'n/a'}
- Tone: {request.tone or 'FRIENDLY_SALES'}
- Primary products: {products}
- Secondary products: {secondary}
- Selling points (customer supplied only): {selling}
- Target audience: {request.target_audience or 'n/a'}
- Location: {request.business_location or 'n/a'}
- Landmark: {request.landmark or 'n/a'}
- CTA: {request.call_to_action or 'n/a'}
- Offer: {request.offer_text or 'n/a'}
- Must include: {must_include}
- Must exclude: {must_exclude}
- Forbidden claims: {request.forbidden_claims}
- Template key: {(template.template_key if template else 'general_business_v1')}
- Opening rules: {opening}
- Body rules: {body}
- CTA rules: {cta_rules}
- Max duration seconds: {request.max_duration_seconds}
"""
    return system_prompt, user_prompt


def _normalize_versions(versions: list, request: ScriptGenerateRequest, maximum_words: int) -> list[dict]:
    wanted = ["SHORT_DIRECT", "FRIENDLY_PROMOTIONAL", "PROFESSIONAL"]
    by_key: dict[str, dict] = {}
    for item in versions:
        if not isinstance(item, dict):
            continue
        key = str(item.get("variant") or item.get("label") or "").upper()
        text = str(item.get("text") or "").strip()
        if key in wanted and text:
            by_key[key] = {
                "variant": key,
                "label": item.get("label") or key.replace("_", " ").title(),
                "text": text,
                "word_count": count_words(text),
            }

    if len(by_key) < 3:
        fallback = _fallback_raw(request)
        for item in fallback["versions"]:
            by_key.setdefault(item["variant"], item)

    return [by_key[key] for key in wanted if key in by_key]


def _fallback_raw(request: ScriptGenerateRequest) -> dict:
    name = request.business_name
    location = request.business_location or ""
    landmark = request.landmark or ""
    products = ", ".join((request.products_or_services or [])[:8]) or "bidhaa na huduma bora"
    secondary = ", ".join((request.secondary_products or [])[:4])
    selling = ", ".join((request.selling_points or [])[:2]) or "bei nafuu na huduma ya kuaminika"
    cta = request.call_to_action or "Karibu ututembelee leo"
    audience = request.target_audience or "wateja wetu"
    place = ", ".join([part for part in [location, landmark] if part]) or "karibu nawe"
    desc = (request.business_description or "").strip()
    desc_part = f"{desc} " if desc and len(desc) < 120 else ""

    short = (
        f"Karibu {name}. {desc_part}"
        f"Tunatoa {products} kwa {selling}. "
        f"Tunapatikana {place}. {cta}."
    )
    friendly = (
        f"Karibu sana {name}. {desc_part}"
        f"Tunawaletea {audience} {products} kwa {selling}. "
        + (f"Pia tuna {secondary}. " if secondary else "")
        + f"Tunapatikana {place}. "
        f"{name} — {cta}. Asante na karibu tena."
    )
    professional = (
        f"Karibu {name}. {desc_part}"
        f"Tunatoa {products} kwa ubora na {selling}. "
        f"Tunapatikana {place}. "
        f"Kwa huduma safi, {cta}."
    )

    return {
        "plain_text": friendly,
        "tone": request.tone or "FRIENDLY_SALES",
        "pronunciation_hints": [{"word": name, "hint": name}] if name else [],
        "warnings": [
            "Generated using offline template fallback — configure GEMINI_API_KEY for richer AI scripts"
        ],
        "versions": [
            {"variant": "SHORT_DIRECT", "label": "Short Direct", "text": short, "word_count": count_words(short)},
            {
                "variant": "FRIENDLY_PROMOTIONAL",
                "label": "Friendly Promotional",
                "text": friendly,
                "word_count": count_words(friendly),
            },
            {
                "variant": "PROFESSIONAL",
                "label": "Professional",
                "text": professional,
                "word_count": count_words(professional),
            },
        ],
    }
