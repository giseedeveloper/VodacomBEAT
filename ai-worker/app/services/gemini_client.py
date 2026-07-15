"""Gemini REST client with structured JSON outputs."""

from __future__ import annotations

import json
import logging
from typing import Any

import httpx

from app.config import GEMINI_API_KEY, GEMINI_BASE_URL, GEMINI_MODEL

logger = logging.getLogger(__name__)


class GeminiClient:
    def __init__(self) -> None:
        self.api_key = GEMINI_API_KEY
        self.model = GEMINI_MODEL
        self.base_url = GEMINI_BASE_URL.rstrip("/")
        # Prefer configured model, then aliases that remain available to new AI Studio keys
        self.model_candidates = [
            self.model,
            "gemini-flash-lite-latest",
            "gemini-3.1-flash-lite",
            "gemini-3-flash-preview",
            "gemini-2.0-flash",
        ]

    def is_configured(self) -> bool:
        return bool(self.api_key)

    def generate_structured(
        self,
        prompt: str,
        response_schema: dict[str, Any],
        *,
        temperature: float = 0.2,
    ) -> tuple[dict[str, Any], dict[str, Any]]:
        if not self.is_configured():
            raise RuntimeError("GEMINI_API_KEY is not configured")

        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": temperature,
                "responseMimeType": "application/json",
                "responseSchema": response_schema,
            },
        }

        errors: list[str] = []
        seen: set[str] = set()
        with httpx.Client(timeout=90.0) as client:
            for model in self.model_candidates:
                if not model or model in seen:
                    continue
                seen.add(model)
                url = f"{self.base_url}/models/{model}:generateContent"
                response = client.post(url, params={"key": self.api_key}, json=payload)
                if response.status_code >= 400:
                    msg = f"{model}:{response.status_code}"
                    errors.append(msg)
                    logger.warning("Gemini model failed %s: %s", msg, response.text[:200])
                    continue

                data = response.json()
                text = self._extract_text(data)
                if not text:
                    errors.append(f"{model}:empty")
                    continue

                usage_meta = data.get("usageMetadata") or {}
                usage = {
                    "input_tokens": usage_meta.get("promptTokenCount"),
                    "output_tokens": usage_meta.get("candidatesTokenCount"),
                    "model": model,
                }
                logger.info("Gemini succeeded with model %s", model)
                return json.loads(text), usage

        raise RuntimeError("Gemini models failed: " + " | ".join(errors))

    @staticmethod
    def _extract_text(data: dict[str, Any]) -> str:
        candidates = data.get("candidates") or []
        if not candidates:
            return ""
        parts = (((candidates[0] or {}).get("content") or {}).get("parts")) or []
        chunks: list[str] = []
        for part in parts:
            if isinstance(part, dict) and part.get("text"):
                chunks.append(str(part["text"]))
        return "".join(chunks).strip()
