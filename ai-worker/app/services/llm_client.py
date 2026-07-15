"""OpenAI-compatible LLM client."""

from __future__ import annotations

import json
import logging
from typing import Any

import httpx

from app.config import LLM_API_KEY, LLM_BASE_URL, LLM_MODEL

logger = logging.getLogger(__name__)


class LlmClient:
    def __init__(self) -> None:
        self.base_url = LLM_BASE_URL.rstrip("/")
        self.api_key = LLM_API_KEY
        self.model = LLM_MODEL

    def is_configured(self) -> bool:
        return bool(self.api_key)

    def generate_json(self, system_prompt: str, user_prompt: str) -> dict[str, Any]:
        if not self.is_configured():
            raise RuntimeError("LLM API key is not configured")

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.7,
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        with httpx.Client(timeout=90.0) as client:
            response = client.post(f"{self.base_url}/chat/completions", json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()

        content = data["choices"][0]["message"]["content"]
        return json.loads(content)
