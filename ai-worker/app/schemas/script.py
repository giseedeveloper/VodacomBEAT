"""Pydantic schemas for script generation."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ScriptTemplateContext(BaseModel):
    template_key: str = "general_business_v1"
    maximum_words: int = 95
    target_duration_seconds: int = 38
    opening_rules: list[str] = Field(default_factory=list)
    body_rules: list[str] = Field(default_factory=list)
    cta_rules: list[str] = Field(default_factory=list)
    prompt_instructions: str | None = None


class ScriptGenerateRequest(BaseModel):
    subscription_id: int
    business_name: str
    business_location: str | None = None
    landmark: str | None = None
    business_industry: str | None = None
    business_description: str | None = None
    products_or_services: list[str] = Field(default_factory=list)
    secondary_products: list[str] = Field(default_factory=list)
    selling_points: list[str] = Field(default_factory=list)
    target_audience: str | None = None
    call_to_action: str | None = None
    offer_text: str | None = None
    must_include_words: list[str] = Field(default_factory=list)
    must_exclude_words: list[str] = Field(default_factory=list)
    category: str | None = None
    objective: str | None = None
    tone: str | None = None
    voice_type: str | None = None
    language: str = "sw-TZ"
    max_duration_seconds: int = 40
    maximum_words: int = 95
    forbidden_claims: list[str] = Field(default_factory=list)
    template: ScriptTemplateContext | None = None
    safe_context: dict[str, Any] = Field(default_factory=dict)


class PronunciationHint(BaseModel):
    word: str
    hint: str


class ScriptVariant(BaseModel):
    variant: str
    label: str | None = None
    text: str
    word_count: int | None = None


class ScriptPayload(BaseModel):
    plain_text: str
    language: str = "sw-TZ"
    tone: str = "FRIENDLY_SALES"
    estimated_duration_seconds: int
    pronunciation_hints: list[PronunciationHint] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    versions: list[dict[str, Any]] = Field(default_factory=list)


class ScriptGenerateResponse(BaseModel):
    success: bool
    message: str = ""
    script: ScriptPayload | None = None
    validation_errors: list[str] = Field(default_factory=list)
