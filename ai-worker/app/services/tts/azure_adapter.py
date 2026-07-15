"""Azure Cognitive Services Speech (sw-TZ Daudi / Rehema)."""

from __future__ import annotations

import logging
import wave
from io import BytesIO

import httpx

from app.config import AZURE_SPEECH_KEY, AZURE_SPEECH_REGION
from app.services.ssml_formatter import build_azure_ssml
from app.services.tts.base import SynthesisResult, TtsProvider, VoiceInfo

logger = logging.getLogger(__name__)

# voice_id → (azure_voice_name, rate%, pitch%)
AZURE_VOICE_PROFILES: dict[str, tuple[str, int, int, str, str]] = {
    # id: azure_name, rate, pitch, gender, label
    "daudi-professional": ("sw-TZ-DaudiNeural", -3, -2, "male", "Daudi — Male Professional"),
    "daudi-energetic": ("sw-TZ-DaudiNeural", 5, 1, "male", "Daudi — Male Energetic"),
    "daudi-calm": ("sw-TZ-DaudiNeural", -8, -4, "male", "Daudi — Male Calm"),
    "rehema-friendly": ("sw-TZ-RehemaNeural", -1, 1, "female", "Rehema — Female Friendly"),
    "rehema-professional": ("sw-TZ-RehemaNeural", -3, 0, "female", "Rehema — Female Professional"),
    "rehema-energetic": ("sw-TZ-RehemaNeural", 4, 2, "female", "Rehema — Female Energetic"),
}


class AzureTtsAdapter(TtsProvider):
    def __init__(self) -> None:
        self.api_key = AZURE_SPEECH_KEY
        self.region = AZURE_SPEECH_REGION

    def is_configured(self) -> bool:
        return bool(self.api_key and self.region)

    def list_voices(self) -> list[VoiceInfo]:
        voices: list[VoiceInfo] = []
        for voice_id, (model_id, _rate, _pitch, gender, label) in AZURE_VOICE_PROFILES.items():
            voices.append(
                VoiceInfo(
                    id=voice_id,
                    label=label,
                    language="sw-TZ",
                    gender=gender,
                    provider="azure",
                    model_id=model_id,
                    is_finetuned=False,
                    license_note="Azure Neural TTS — production sw-TZ",
                )
            )
        return voices

    def synthesize(
        self,
        text: str,
        voice_id: str,
        speaking_rate: float = 1.0,
        pronunciation_hints: list[dict[str, str]] | None = None,
    ) -> SynthesisResult:
        if not self.is_configured():
            raise RuntimeError("Azure Speech is not configured (AZURE_SPEECH_KEY / AZURE_SPEECH_REGION)")

        profile = AZURE_VOICE_PROFILES.get(voice_id)
        if profile is None:
            # Allow direct Azure voice names
            azure_name = voice_id if voice_id.startswith("sw-TZ-") else "sw-TZ-DaudiNeural"
            rate, pitch = -3, -2
            if speaking_rate and speaking_rate != 1.0:
                rate = int((speaking_rate - 1.0) * 100)
        else:
            azure_name, rate, pitch, _gender, _label = profile
            if speaking_rate and speaking_rate != 1.0:
                rate = int(rate + (speaking_rate - 1.0) * 50)

        ssml = build_azure_ssml(
            text,
            voice_name=azure_name,
            rate_percent=rate,
            pitch_percent=pitch,
            hints=pronunciation_hints,
        )

        url = f"https://{self.region}.tts.speech.microsoft.com/cognitiveservices/v1"
        headers = {
            "Ocp-Apim-Subscription-Key": self.api_key,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "riff-16khz-16bit-mono-pcm",
            "User-Agent": "BizTune-Beat-AI-Worker",
        }

        with httpx.Client(timeout=90.0) as client:
            response = client.post(url, content=ssml.encode("utf-8"), headers=headers)
            if response.status_code >= 400:
                logger.error("Azure TTS error %s: %s", response.status_code, response.text[:400])
                response.raise_for_status()
            audio_bytes = response.content

        duration = _wav_duration_seconds(audio_bytes)
        return SynthesisResult(pcm_wav_bytes=audio_bytes, sample_rate=16000, duration_seconds=duration)


def _wav_duration_seconds(wav_bytes: bytes) -> float:
    try:
        with wave.open(BytesIO(wav_bytes), "rb") as handle:
            frames = handle.getnframes()
            rate = handle.getframerate() or 16000
            return round(frames / float(rate), 2)
    except Exception:
        # rough estimate for raw-ish payloads
        return round(max(1.0, len(wav_bytes) / (16000 * 2)), 2)
