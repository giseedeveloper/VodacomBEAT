"""RQ task helpers."""

from __future__ import annotations

from app.schemas.script import ScriptGenerateRequest
from app.services.script_generator import generate_script


def enqueue_script_generation(payload: dict) -> dict:
    request = ScriptGenerateRequest(**payload)
    result = generate_script(request)
    return result.model_dump()
