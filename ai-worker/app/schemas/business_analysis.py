"""Business analysis schemas (Gemini structured classification)."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field, field_validator


BUSINESS_CATEGORIES = [
    "RETAIL_FASHION",
    "FOOD_HOSPITALITY",
    "BEAUTY_PERSONAL_CARE",
    "HEALTH_PHARMACY",
    "EDUCATION",
    "TRANSPORT_LOGISTICS",
    "REAL_ESTATE_CONSTRUCTION",
    "FINANCE_INSURANCE",
    "PROFESSIONAL_SERVICES",
    "TECHNOLOGY_TELECOM",
    "AGRICULTURE",
    "EVENTS_ENTERTAINMENT",
    "RELIGIOUS_COMMUNITY",
    "GENERAL_OTHER",
]

AD_OBJECTIVES = [
    "VISIT_STORE",
    "CALL_NOW",
    "BOOK_SERVICE",
    "PROMOTE_PRODUCTS",
    "ANNOUNCE_OFFER",
    "BRAND_AWARENESS",
    "EVENT_ANNOUNCEMENT",
]

SCRIPT_TONES = [
    "FRIENDLY_SALES",
    "PROFESSIONAL",
    "ENERGETIC",
    "CALM",
    "LUXURY",
    "YOUTHFUL",
    "RESPECTFUL",
]

MISSING_FIELDS = [
    "BUSINESS_NAME",
    "PRODUCTS_OR_SERVICES",
    "LOCATION",
    "CALL_TO_ACTION",
    "TARGET_AUDIENCE",
    "SELLING_POINT",
]

RISK_FLAGS = [
    "NONE",
    "MEDICAL_CLAIM",
    "FINANCIAL_CLAIM",
    "LEGAL_CLAIM",
    "RELIGIOUS_SENSITIVITY",
    "AGE_RESTRICTED_PRODUCT",
    "MISLEADING_PROMOTION",
]


class BusinessAnalyzeRequest(BaseModel):
    subscription_id: int | None = None
    business_name: str
    description: str = ""
    products_or_services: list[str] = Field(default_factory=list)
    secondary_products: list[str] = Field(default_factory=list)
    target_audience: str | None = None
    location: str | None = None
    landmark: str | None = None
    call_to_action: str | None = None
    preferred_tone: str | None = None
    selling_points: list[str] = Field(default_factory=list)
    offer_text: str | None = None
    must_include_words: list[str] = Field(default_factory=list)
    must_exclude_words: list[str] = Field(default_factory=list)
    allowed_categories: list[str] = Field(default_factory=lambda: list(BUSINESS_CATEGORIES))
    allowed_objectives: list[str] = Field(default_factory=lambda: list(AD_OBJECTIVES))
    allowed_tones: list[str] = Field(default_factory=lambda: list(SCRIPT_TONES))
    allowed_missing_fields: list[str] = Field(default_factory=lambda: list(MISSING_FIELDS))
    allowed_risk_flags: list[str] = Field(default_factory=lambda: list(RISK_FLAGS))


class BusinessAnalysisResult(BaseModel):
    category: str
    subcategory: str
    objective: str
    recommendedTone: str
    confidence: float = Field(ge=0, le=1)
    businessSummary: str = ""
    primaryProductsOrServices: list[str] = Field(default_factory=list)
    targetAudience: list[str] = Field(default_factory=list)
    keySellingPoints: list[str] = Field(default_factory=list)
    detectedLocation: str | None = None
    recommendedTemplateKey: str = "general_business_v1"
    missingFields: list[str] = Field(default_factory=list)
    followUpQuestions: list[str] = Field(default_factory=list)
    riskFlags: list[str] = Field(default_factory=list)

    @field_validator("confidence", mode="before")
    @classmethod
    def clamp_confidence(cls, value: Any) -> float:
        try:
            number = float(value)
        except (TypeError, ValueError):
            return 0.0
        return max(0.0, min(1.0, number))


class BusinessAnalyzeResponse(BaseModel):
    success: bool
    message: str = ""
    provider: str = "gemini"
    model: str | None = None
    analysis: BusinessAnalysisResult | None = None
    usage: dict[str, Any] = Field(default_factory=dict)


BUSINESS_ANALYSIS_JSON_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "category": {"type": "string", "enum": BUSINESS_CATEGORIES},
        "subcategory": {"type": "string"},
        "objective": {"type": "string", "enum": AD_OBJECTIVES},
        "recommendedTone": {"type": "string", "enum": SCRIPT_TONES},
        "confidence": {"type": "number"},
        "businessSummary": {"type": "string"},
        "primaryProductsOrServices": {"type": "array", "items": {"type": "string"}},
        "targetAudience": {"type": "array", "items": {"type": "string"}},
        "keySellingPoints": {"type": "array", "items": {"type": "string"}},
        "detectedLocation": {"type": "string"},
        "recommendedTemplateKey": {"type": "string"},
        "missingFields": {"type": "array", "items": {"type": "string", "enum": MISSING_FIELDS}},
        "followUpQuestions": {"type": "array", "items": {"type": "string"}},
        "riskFlags": {"type": "array", "items": {"type": "string", "enum": RISK_FLAGS}},
    },
    "required": [
        "category",
        "subcategory",
        "objective",
        "recommendedTone",
        "confidence",
        "businessSummary",
        "primaryProductsOrServices",
        "targetAudience",
        "keySellingPoints",
        "detectedLocation",
        "recommendedTemplateKey",
        "missingFields",
        "followUpQuestions",
        "riskFlags",
    ],
}
