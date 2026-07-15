"""TTS provider interface — swap engines without changing API routes."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class VoiceInfo:
    id: str
    label: str
    language: str
    gender: str
    provider: str
    model_id: str
    is_finetuned: bool = False
    license_note: str = ""


@dataclass
class SynthesisResult:
    pcm_wav_bytes: bytes
    sample_rate: int
    duration_seconds: float


class TtsProvider(ABC):
    @abstractmethod
    def list_voices(self) -> list[VoiceInfo]:
        raise NotImplementedError

    @abstractmethod
    def synthesize(
        self,
        text: str,
        voice_id: str,
        speaking_rate: float = 1.0,
        pronunciation_hints: list[dict[str, str]] | None = None,
    ) -> SynthesisResult:
        raise NotImplementedError
