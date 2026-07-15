"""Orchestrate TTS synthesis + FFmpeg profile rendering + QC."""

from __future__ import annotations

import base64
import hashlib
import tempfile
from pathlib import Path

from app.schemas.audio import GeneratedAudio, TtsSynthesizeRequest, TtsSynthesizeResponse
from app.services.audio_processor import process_wav_profile, validate_audio_file
from app.services.audio_render_profile import profile_from_request
from app.services.music_library import list_music_tracks, resolve_music_path
from app.services.tts.registry import get_tts_provider


def synthesize_audio(request: TtsSynthesizeRequest) -> TtsSynthesizeResponse:
    provider = get_tts_provider()
    hints = [hint.model_dump() for hint in request.pronunciation_hints]
    music_path = resolve_music_path(request.music_track_id)

    # Prefer intensity override; otherwise use track default volume from manifest
    track_default = 0.2
    for track in list_music_tracks():
        if track.id == request.music_track_id:
            track_default = float(track.default_volume or 0.2)
            break

    music_volume = track_default
    if request.music_intensity == "soft":
        music_volume = max(0.1, track_default * 0.7)
    elif request.music_intensity == "none" or request.music_track_id in (None, "none"):
        music_path = None
        music_volume = 0.0
    elif request.music_intensity == "medium":
        music_volume = track_default
    elif request.music_intensity == "strong":
        music_volume = min(0.32, track_default * 1.35)

    speaking_rate = request.speaking_rate
    if request.speaking_speed == "slow":
        speaking_rate = 0.85
    elif request.speaking_speed == "fast":
        speaking_rate = 1.12
    elif request.speaking_speed == "normal":
        speaking_rate = 1.0

    try:
        raw = provider.synthesize(
            text=request.text,
            voice_id=request.voice_id,
            speaking_rate=speaking_rate,
            pronunciation_hints=hints,
        )
    except Exception as exc:
        return TtsSynthesizeResponse(success=False, message=str(exc))

    render_name = None
    if request.render_mode == "preview" or request.profile.watermark:
        render_name = "preview"
    if request.render_mode == "pronunciation_test":
        render_name = "pronunciation_test"
        music_path = None
    if request.render_mode == "final":
        render_name = "final"

    try:
        processed, duration = process_wav_profile(
            raw.pcm_wav_bytes,
            sample_rate=request.profile.sample_rate,
            channels=request.profile.channels,
            output_format=request.profile.format,
            max_duration_seconds=request.profile.max_duration_seconds,
            watermark=request.profile.watermark,
            music_path=music_path,
            music_volume=music_volume,
            render_name=render_name,
        )
    except Exception as exc:
        return TtsSynthesizeResponse(success=False, message=f"Audio processing failed: {exc}")

    qc = _run_qc(processed, request)
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
            music_track_id=None if render_name == "pronunciation_test" else request.music_track_id,
            content_base64=encoded,
            checksum_sha256=checksum,
            qc_report=qc,
            qc_passed=bool(qc.get("passed", True)),
        ),
    )


def _run_qc(audio_bytes: bytes, request: TtsSynthesizeRequest) -> dict:
    profile = profile_from_request(
        sample_rate=request.profile.sample_rate,
        channels=request.profile.channels,
        output_format=request.profile.format,
        max_duration_seconds=request.profile.max_duration_seconds,
        watermark=request.profile.watermark,
        render_name=request.render_mode,
    )
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / f"qc.{request.profile.format}"
        path.write_bytes(audio_bytes)
        try:
            return validate_audio_file(path, profile)
        except Exception as exc:
            return {"passed": False, "problems": [str(exc)]}
