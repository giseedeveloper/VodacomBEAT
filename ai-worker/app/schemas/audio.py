"""Audio / TTS API schemas."""

from __future__ import annotations

from pydantic import BaseModel, Field


class PronunciationHint(BaseModel):
    word: str
    hint: str


class VoiceResponse(BaseModel):
    id: str
    label: str
    language: str
    gender: str
    provider: str
    model_id: str
    is_finetuned: bool = False
    license_note: str = ""


class AudioProfile(BaseModel):
    format: str = "wav"
    sample_rate: int = 44100
    channels: int = 1
    bit_depth: int = 16
    max_duration_seconds: int = 30
    watermark: bool = False


class TtsSynthesizeRequest(BaseModel):
    subscription_id: int
    text: str
    voice_id: str
    speaking_rate: float = 1.0
    pronunciation_hints: list[PronunciationHint] = Field(default_factory=list)
    profile: AudioProfile = Field(default_factory=AudioProfile)
    music_track_id: str | None = "warm_pad"


class MusicTrackResponse(BaseModel):
    id: str
    label: str
    mood: str = "calm"


class GeneratedAudio(BaseModel):
    format: str
    sample_rate: int
    channels: int
    duration_seconds: float
    voice_id: str
    music_track_id: str | None = None
    content_base64: str
    checksum_sha256: str


class TtsSynthesizeResponse(BaseModel):
    success: bool
    message: str = ""
    audio: GeneratedAudio | None = None
