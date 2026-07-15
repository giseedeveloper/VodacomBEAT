"""Orchestrate TTS synthesis + FFmpeg profile rendering."""

from __future__ import annotations

import base64
import hashlib

from app.schemas.audio import GeneratedAudio, TtsSynthesizeRequest, TtsSynthesizeResponse
from app.services.audio_processor import process_wav_profile
from app.services.music_library import resolve_music_path
from app.services.tts.registry import get_tts_provider


def synthesize_audio(request: TtsSynthesizeRequest) -> TtsSynthesizeResponse:
    provider = get_tts_provider()
    hints = [hint.model_dump() for hint in request.pronunciation_hints]
    music_path = resolve_music_path(request.music_track_id)

    try:
        raw = provider.synthesize(
            text=request.text,
            voice_id=request.voice_id,
            speaking_rate=request.speaking_rate,
            pronunciation_hints=hints,
        )
    except Exception as exc:
        return TtsSynthesizeResponse(success=False, message=str(exc))

    try:
        processed, duration = process_wav_profile(
            raw.pcm_wav_bytes,
            sample_rate=request.profile.sample_rate,
            channels=request.profile.channels,
            output_format=request.profile.format,
            max_duration_seconds=request.profile.max_duration_seconds,
            watermark=request.profile.watermark,
            music_path=music_path,
        )
    except Exception as exc:
        return TtsSynthesizeResponse(success=False, message=f"Audio processing failed: {exc}")

    checksum = hashlib.sha256(processed).hexdigest()
    encoded = base64.b64encode(processed).decode("ascii")

    return TtsSynthesizeResponse(
        success=True,
        message="Audio generated",
        audio=GeneratedAudio(
            format=request.profile.format,
            sample_rate=request.profile.sample_rate,
            channels=request.profile.channels,
            duration_seconds=duration or raw.duration_seconds,
            voice_id=request.voice_id,
            music_track_id=request.music_track_id,
            content_base64=encoded,
            checksum_sha256=checksum,
        ),
    )
