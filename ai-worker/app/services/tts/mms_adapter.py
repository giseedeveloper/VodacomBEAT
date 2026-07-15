"""Meta MMS-TTS adapter (facebook/mms-tts-swh and fine-tuned checkpoints)."""

from __future__ import annotations

import logging
import re
import threading
from pathlib import Path

import numpy as np
import torch
from transformers import AutoTokenizer, VitsModel

from app.services.tts.base import SynthesisResult, TtsProvider, VoiceInfo

logger = logging.getLogger(__name__)

_MODEL_CACHE: dict[str, tuple[VitsModel, AutoTokenizer, int]] = {}
_CACHE_LOCK = threading.Lock()


def _resolve_model_source(voice: VoiceInfo) -> str:
    if voice.model_id.startswith("local/"):
        local_name = voice.model_id.replace("local/", "", 1)
        local_path = Path("/app/models") / local_name
        if local_path.exists():
            return str(local_path)
        raise RuntimeError(f"Local fine-tuned model not found at {local_path}")
    return voice.model_id


def _load_model(model_source: str) -> tuple[VitsModel, AutoTokenizer, int]:
    with _CACHE_LOCK:
        if model_source in _MODEL_CACHE:
            return _MODEL_CACHE[model_source]

        logger.info("Loading MMS-TTS model: %s", model_source)
        tokenizer = AutoTokenizer.from_pretrained(model_source)
        model = VitsModel.from_pretrained(model_source)
        model.eval()
        sample_rate = int(getattr(model.config, "sampling_rate", 16000))
        _MODEL_CACHE[model_source] = (model, tokenizer, sample_rate)
        return _MODEL_CACHE[model_source]


def _apply_pronunciation_hints(text: str, hints: list[dict[str, str]]) -> str:
    updated = text
    for hint in hints:
        word = hint.get("word", "").strip()
        replacement = hint.get("hint", "").strip()
        if word and replacement:
            updated = re.sub(re.escape(word), replacement, updated, flags=re.IGNORECASE)
    return updated


def _pcm16_wav_bytes(waveform: np.ndarray, sample_rate: int) -> bytes:
    import io

    import soundfile as sf

    clipped = np.clip(waveform, -1.0, 1.0)
    pcm = (clipped * 32767.0).astype(np.int16)
    buffer = io.BytesIO()
    sf.write(buffer, pcm, sample_rate, format="WAV", subtype="PCM_16")
    return buffer.getvalue()


class MmsTtsAdapter(TtsProvider):
    def __init__(self, voices: list[VoiceInfo]) -> None:
        self.voices = {voice.id: voice for voice in voices}

    def list_voices(self) -> list[VoiceInfo]:
        return list(self.voices.values())

    def synthesize(
        self,
        text: str,
        voice_id: str,
        speaking_rate: float = 1.0,
        pronunciation_hints: list[dict[str, str]] | None = None,
    ) -> SynthesisResult:
        voice = self.voices.get(voice_id)
        if voice is None:
            raise ValueError(f"Unknown voice id: {voice_id}")

        normalized = _apply_pronunciation_hints(text.strip(), pronunciation_hints or [])
        if not normalized:
            raise ValueError("Script text is empty")

        model_source = _resolve_model_source(voice)
        model, tokenizer, sample_rate = _load_model(model_source)

        inputs = tokenizer(normalized, return_tensors="pt")
        with torch.inference_mode():
            output = model(**inputs).waveform

        waveform = output.squeeze().cpu().numpy().astype(np.float32)
        if speaking_rate and speaking_rate != 1.0:
            target_len = max(1, int(len(waveform) / speaking_rate))
            indices = np.linspace(0, len(waveform) - 1, target_len)
            waveform = np.interp(indices, np.arange(len(waveform)), waveform).astype(np.float32)

        duration = len(waveform) / sample_rate if sample_rate else 0.0
        return SynthesisResult(
            pcm_wav_bytes=_pcm16_wav_bytes(waveform, sample_rate),
            sample_rate=sample_rate,
            duration_seconds=round(duration, 2),
        )
