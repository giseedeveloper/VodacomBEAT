"""Pydantic schemas for script generation."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ScriptGenerateRequest(BaseModel):
    subscription_id: int
    business_name: str
    business_location: str | None = None
    business_industry: str | None = None
    call_to_action: str | None = None
    voice_type: str | None = None
    language: str = "sw-TZ"
    max_duration_seconds: int = 30
    forbidden_claims: list[str] = Field(default_factory=list)


class PronunciationHint(BaseModel):
    word: str
    hint: str


class ScriptPayload(BaseModel):
    plain_text: str
    language: str = "sw-TZ"
    tone: str = "professional"
    estimated_duration_seconds: int
    pronunciation_hints: list[PronunciationHint] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    versions: list[dict[str, Any]] = Field(default_factory=list)


class ScriptGenerateResponse(BaseModel):
    success: bool
    message: str = ""
    script: ScriptPayload | None = None
    validation_errors: list[str] = Field(default_factory=list)
