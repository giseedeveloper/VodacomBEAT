"""Try Azure → MMS → local so one provider outage does not block previews."""

from __future__ import annotations

import logging

from app.config import AZURE_SPEECH_KEY
from app.services.tts.base import SynthesisResult, TtsProvider, VoiceInfo

logger = logging.getLogger(__name__)


def _map_voice_for_provider(provider: TtsProvider, voice_id: str) -> str:
    """Azure profile slugs are not valid MMS/local model ids — remap on fallback."""
    name = type(provider).__name__.lower()
    vid = (voice_id or "").strip()
    lower = vid.lower()

    if "mms" in name:
        voices = {v.id: v for v in provider.list_voices()}
        voice = voices.get(vid)
        if voice and getattr(voice, "provider", "") == "mms":
            return vid
        for candidate in ("mms-swh-fallback", "mms-swh-default"):
            alt = voices.get(candidate)
            if alt and getattr(alt, "provider", "mms") in ("mms", ""):
                return candidate
        for alt in voices.values():
            if getattr(alt, "provider", "") == "mms" or "mms-tts" in (alt.model_id or ""):
                return alt.id
        return vid

    if "local" in name:
        want_female = any(x in lower for x in ("rehema", "female", "woman"))
        return "local-female" if want_female else "local-male"

    return vid


class CascadingTtsProvider(TtsProvider):
    def __init__(self, providers: list[TtsProvider]) -> None:
        self.providers = [p for p in providers if p is not None]
        if not self.providers:
            raise RuntimeError("No TTS providers available")

    def list_voices(self) -> list[VoiceInfo]:
        seen: set[str] = set()
        voices: list[VoiceInfo] = []
        for provider in self.providers:
            try:
                for voice in provider.list_voices():
                    if voice.id in seen:
                        continue
                    seen.add(voice.id)
                    voices.append(voice)
            except Exception as exc:
                logger.warning("list_voices failed for %s: %s", type(provider).__name__, exc)
        return voices

    def synthesize(
        self,
        text: str,
        voice_id: str,
        speaking_rate: float = 1.0,
        pronunciation_hints: list[dict[str, str]] | None = None,
    ) -> SynthesisResult:
        errors: list[str] = []
        for provider in self.providers:
            mapped = _map_voice_for_provider(provider, voice_id)
            try:
                result = provider.synthesize(
                    text=text,
                    voice_id=mapped,
                    speaking_rate=speaking_rate,
                    pronunciation_hints=pronunciation_hints,
                )
                if result and result.pcm_wav_bytes:
                    logger.info(
                        "TTS succeeded via %s (voice %s → %s)",
                        type(provider).__name__,
                        voice_id,
                        mapped,
                    )
                    return result
            except Exception as exc:
                msg = f"{type(provider).__name__}: {exc}"
                errors.append(msg)
                logger.warning("TTS provider failed — %s", msg)
                continue

        raise RuntimeError("All TTS providers failed: " + " | ".join(errors))


def build_cascading_provider() -> TtsProvider:
    providers: list[TtsProvider] = []

    if AZURE_SPEECH_KEY:
        from app.services.tts.azure_adapter import AzureTtsAdapter

        azure = AzureTtsAdapter()
        if azure.is_configured():
            providers.append(azure)

    try:
        import torch  # noqa: F401
        import transformers  # noqa: F401

        from pathlib import Path
        import json
        from app.config import VOICES_MANIFEST_PATH
        from app.services.tts.mms_adapter import MmsTtsAdapter

        voices: list[VoiceInfo] = []
        path = Path(VOICES_MANIFEST_PATH)
        if path.exists():
            payload = json.loads(path.read_text(encoding="utf-8"))
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
        providers.append(MmsTtsAdapter(voices))
    except Exception:
        pass

    from app.services.tts.local_fallback import LocalFallbackTtsAdapter

    providers.append(LocalFallbackTtsAdapter())
    return CascadingTtsProvider(providers)
