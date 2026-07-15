"""Business classification — Gemini structured analysis + offline fallback."""

from __future__ import annotations

import logging
import re

from app.config import GEMINI_MODEL
from app.schemas.business_analysis import (
    AD_OBJECTIVES,
    BUSINESS_ANALYSIS_JSON_SCHEMA,
    BUSINESS_CATEGORIES,
    BusinessAnalysisResult,
    BusinessAnalyzeRequest,
    BusinessAnalyzeResponse,
    SCRIPT_TONES,
)
from app.services.gemini_client import GeminiClient

logger = logging.getLogger(__name__)

ANALYSIS_PROMPT = """You are a business classification engine for a Tanzanian caller-tune advertising platform.

Your task:
1. Analyze the supplied business information.
2. Select exactly one category from the permitted category enum.
3. Select the most appropriate advertising objective.
4. Recommend a tone.
5. Detect missing information required for a caller-tune script.
6. Never invent prices, phone numbers, locations, promotions or product claims.
7. Use Tanzanian business and Kiswahili context.
8. A template key is only a recommendation. The backend will validate it.
9. Return only the JSON required by the response schema.

Suggested template key patterns (recommendation only):
- RETAIL_FASHION + VISIT_STORE → retail_store_visit_friendly_v1
- FOOD_HOSPITALITY + VISIT_STORE → food_visit_friendly_v1
- otherwise → general_business_v1

BUSINESS INFORMATION:
Business name: {business_name}
Description: {description}
Products/services: {products}
Secondary products: {secondary}
Target audience: {audience}
Location: {location}
Landmark: {landmark}
Desired call to action: {cta}
Preferred tone: {tone}
Selling points: {selling_points}
Offer: {offer}
Must include words: {must_include}
Must exclude words: {must_exclude}
"""


def analyze_business(request: BusinessAnalyzeRequest) -> BusinessAnalyzeResponse:
    prompt = ANALYSIS_PROMPT.format(
        business_name=request.business_name,
        description=request.description or "Not provided",
        products=request.products_or_services or [],
        secondary=request.secondary_products or [],
        audience=request.target_audience or "Not provided",
        location=request.location or "Not provided",
        landmark=request.landmark or "Not provided",
        cta=request.call_to_action or "Not provided",
        tone=request.preferred_tone or "Not provided",
        selling_points=request.selling_points or [],
        offer=request.offer_text or "Not provided",
        must_include=request.must_include_words or [],
        must_exclude=request.must_exclude_words or [],
    )

    client = GeminiClient()
    try:
        if client.is_configured():
            raw, usage = client.generate_structured(prompt, BUSINESS_ANALYSIS_JSON_SCHEMA)
            result = BusinessAnalysisResult.model_validate(raw)
            result = _sanitize_against_allowlists(result, request)
            return BusinessAnalyzeResponse(
                success=True,
                message="Business analysis completed",
                provider="gemini",
                model=GEMINI_MODEL,
                analysis=result,
                usage=usage,
            )

        logger.warning("GEMINI_API_KEY missing — using heuristic business analysis")
        result = _heuristic_analysis(request)
        return BusinessAnalyzeResponse(
            success=True,
            message="Business analysis completed (offline heuristic)",
            provider="heuristic",
            model=None,
            analysis=result,
            usage={},
        )
    except Exception as exc:
        logger.exception("business analysis failed")
        # Soft-fallback so drafting still works offline
        result = _heuristic_analysis(request)
        # Only crush confidence for ambiguous categories — clear retail/food matches stay usable
        if result.category == "GENERAL_OTHER":
            result.confidence = min(result.confidence, 0.55)
            result.followUpQuestions = result.followUpQuestions or [
                "Eleza bidhaa au huduma kuu unazotaka zitajwe.",
                "Biashara yako inapatikana eneo gani?",
                "Unataka msikilizaji afanye nini baada ya kusikia tangazo?",
            ]
        return BusinessAnalyzeResponse(
            success=True,
            message=f"Used heuristic fallback after Gemini error: {exc}",
            provider="heuristic",
            model=None,
            analysis=result,
            usage={},
        )


def _sanitize_against_allowlists(
    result: BusinessAnalysisResult,
    request: BusinessAnalyzeRequest,
) -> BusinessAnalysisResult:
    if result.category not in (request.allowed_categories or BUSINESS_CATEGORIES):
        result.category = "GENERAL_OTHER"
    if result.objective not in (request.allowed_objectives or AD_OBJECTIVES):
        result.objective = "BRAND_AWARENESS"
    if result.recommendedTone not in (request.allowed_tones or SCRIPT_TONES):
        result.recommendedTone = "FRIENDLY_SALES"

    allowed_missing = set(request.allowed_missing_fields or [])
    result.missingFields = [f for f in result.missingFields if f in allowed_missing]

    allowed_risk = set(request.allowed_risk_flags or [])
    result.riskFlags = [f for f in result.riskFlags if f in allowed_risk] or ["NONE"]

    result.followUpQuestions = (result.followUpQuestions or [])[:3]
    result.primaryProductsOrServices = (result.primaryProductsOrServices or [])[:15]
    result.targetAudience = (result.targetAudience or [])[:10]
    result.keySellingPoints = (result.keySellingPoints or [])[:10]
    return result


def _heuristic_analysis(request: BusinessAnalyzeRequest) -> BusinessAnalysisResult:
    blob = " ".join(
        [
            request.business_name,
            request.description or "",
            " ".join(request.products_or_services or []),
            request.location or "",
            request.call_to_action or "",
        ]
    ).lower()

    category = "GENERAL_OTHER"
    subcategory = "GENERAL"
    template = "general_business_v1"
    objective = "BRAND_AWARENESS"
    tone = request.preferred_tone if request.preferred_tone in SCRIPT_TONES else "FRIENDLY_SALES"
    risk = ["NONE"]

    retail_tokens = ["kanzu", "fashion", "mavazi", "nguo", "kofia", "nikabu", "perfume", "duka"]
    food_tokens = ["chakula", "restaurant", "cafe", "hoteli", "chini", "nyama", "chipsi"]
    islamic_tokens = ["kiislam", "kiislamu", "miswala", "msikiti", "hijab", "nikabu", "forowanga"]

    if any(t in blob for t in retail_tokens):
        category = "RETAIL_FASHION"
        subcategory = "GENERAL_RETAIL_FASHION"
        template = "retail_store_visit_friendly_v1"
        objective = "VISIT_STORE"
    elif any(t in blob for t in food_tokens):
        category = "FOOD_HOSPITALITY"
        subcategory = "FOOD_SERVICE"
        template = "food_visit_friendly_v1"
        objective = "VISIT_STORE"

    if any(t in blob for t in islamic_tokens):
        if category == "RETAIL_FASHION":
            subcategory = "ISLAMIC_AND_GENERAL_FASHION"
        risk = ["RELIGIOUS_SENSITIVITY"]
        tone = "RESPECTFUL" if tone == "FRIENDLY_SALES" else tone

    if re.search(r"piga|simu|call", blob):
        objective = "CALL_NOW"
    elif re.search(r"tembelea|karibu|duka|store|visit", blob):
        objective = "VISIT_STORE"
    elif re.search(r"booking|book|miadi", blob):
        objective = "BOOK_SERVICE"

    missing: list[str] = []
    questions: list[str] = []
    if not request.business_name.strip():
        missing.append("BUSINESS_NAME")
    if not request.products_or_services and len((request.description or "").split()) < 4:
        missing.append("PRODUCTS_OR_SERVICES")
        questions.append("Ni bidhaa gani kuu ungependa zitajwe kwenye tangazo?")
    if not request.location:
        missing.append("LOCATION")
        questions.append("Biashara yako inapatikana eneo gani?")
    if not request.call_to_action:
        missing.append("CALL_TO_ACTION")
        questions.append("Unataka msikilizaji akutembelee, akupigie simu au aagize?")

    products = list(request.products_or_services or [])
    if not products and request.description:
        products = [p.strip() for p in re.split(r"[,;]/", request.description) if p.strip()][:8]

    confidence = 0.82
    if missing:
        confidence = 0.6
    if category == "GENERAL_OTHER":
        confidence = min(confidence, 0.7)

    return BusinessAnalysisResult(
        category=category,
        subcategory=subcategory,
        objective=objective,
        recommendedTone=tone,
        confidence=confidence,
        businessSummary=(request.description or request.business_name)[:500],
        primaryProductsOrServices=products[:15],
        targetAudience=[request.target_audience] if request.target_audience else [],
        keySellingPoints=list(request.selling_points or [])[:10],
        detectedLocation=request.location,
        recommendedTemplateKey=template,
        missingFields=missing,
        followUpQuestions=questions[:3],
        riskFlags=risk,
    )
