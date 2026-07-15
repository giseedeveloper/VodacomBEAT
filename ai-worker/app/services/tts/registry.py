"""Resolve configured TTS provider — cascading Azure → MMS → local."""

from __future__ import annotations

import json
import logging
from functools import lru_cache
from pathlib import Path

from app.config import AZURE_SPEECH_KEY, TTS_PROVIDER, VOICES_MANIFEST_PATH
from app.services.tts.base import TtsProvider, VoiceInfo

logger = logging.getLogger(__name__)


def _load_voice_manifest() -> list[VoiceInfo]:
    manifest_path = Path(VOICES_MANIFEST_PATH)
    if not manifest_path.exists():
        return []

    payload = json.loads(manifest_path.read_text(encoding="utf-8"))
    voices: list[VoiceInfo] = []
    for item in payload.get("voices", []):
        voices.append(
            VoiceInfo(
                id=item["id"],
                label=item["label"],
                language=item.get("language", "sw-TZ"),
                gender=item.get("gender", "neutral"),
                provider=item.get("provider", "mms"),
                model_id=item["model_id"],
                is_finetuned=bool(item.get("is_finetuned", False)),
                license_note=item.get("license_note", ""),
            )
        )
    return voices


def _mms_available() -> bool:
    try:
        import torch  # noqa: F401
        import transformers  # noqa: F401

        return True
    except Exception:
        return False


@lru_cache(maxsize=1)
def get_tts_provider() -> TtsProvider:
    provider = TTS_PROVIDER.lower().strip()

    # Production path: cascading fallback always preferred for reliability
    if provider in {"azure", "auto", "cascade", ""} or AZURE_SPEECH_KEY:
        from app.services.tts.cascading import build_cascading_provider

        logger.info("Using cascading TTS provider (Azure → MMS → local)")
        return build_cascading_provider()

    if provider == "mms" and _mms_available():
        from app.services.tts.mms_adapter import MmsTtsAdapter

        return MmsTtsAdapter(_load_voice_manifest())

    from app.services.tts.local_fallback import LocalFallbackTtsAdapter

    return LocalFallbackTtsAdapter()


def list_voices() -> list[VoiceInfo]:
    return get_tts_provider().list_voices()
