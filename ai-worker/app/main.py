"""FastAPI entrypoint for the BEAT AI worker."""

from __future__ import annotations

import logging

from fastapi import Depends, FastAPI, Header, HTTPException

from app.config import INTERNAL_TOKEN
from app.schemas.audio import AudioProfile, MusicTrackResponse, TtsSynthesizeRequest, TtsSynthesizeResponse, VoiceResponse
from app.schemas.business_analysis import BusinessAnalyzeRequest, BusinessAnalyzeResponse
from app.schemas.script import ScriptGenerateRequest, ScriptGenerateResponse
from app.services.business_analyzer import analyze_business
from app.services.script_generator import generate_script

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="BEAT AI Worker", version="0.2.0")


def verify_token(authorization: str | None = Header(default=None)) -> None:
    if INTERNAL_TOKEN == "":
        return
    expected = f"Bearer {INTERNAL_TOKEN}"
    if authorization != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.get("/health")
def health() -> dict[str, str]:
    from app.config import TTS_PROVIDER

    return {"status": "ok", "service": "beat-ai-worker", "tts_provider": TTS_PROVIDER}


@app.get("/v1/tts/voices", response_model=list[VoiceResponse])
def tts_voices(_: None = Depends(verify_token)) -> list[VoiceResponse]:
    from app.services.tts.registry import list_voices

    return [
        VoiceResponse(
            id=voice.id,
            label=voice.label,
            language=voice.language,
            gender=voice.gender,
            provider=voice.provider,
            model_id=voice.model_id,
            is_finetuned=voice.is_finetuned,
            license_note=voice.license_note,
        )
        for voice in list_voices()
    ]


@app.get("/v1/music/tracks", response_model=list[MusicTrackResponse])
def music_tracks(_: None = Depends(verify_token)) -> list[MusicTrackResponse]:
    from app.services.music_library import list_music_tracks

    return [
        MusicTrackResponse(
            id=track.id,
            label=track.label,
            mood=track.mood,
            category=track.category,
            recommended_for=track.recommended_for or [],
        )
        for track in list_music_tracks()
    ]


@app.post("/v1/tts/synthesize", response_model=TtsSynthesizeResponse)
def tts_synthesize(
    request: TtsSynthesizeRequest,
    _: None = Depends(verify_token),
) -> TtsSynthesizeResponse:
    from app.services.tts_synthesizer import synthesize_audio

    return synthesize_audio(request)


@app.post("/v1/tts/preview", response_model=TtsSynthesizeResponse)
def tts_preview(
    request: TtsSynthesizeRequest,
    _: None = Depends(verify_token),
) -> TtsSynthesizeResponse:
    from app.services.tts_synthesizer import synthesize_audio

    request.profile = request.profile or AudioProfile()
    request.profile.watermark = True
    request.profile.format = "mp3"
    request.profile.sample_rate = 16000
    request.profile.channels = 1
    request.profile.max_duration_seconds = min(request.profile.max_duration_seconds or 15, 15)
    request.render_mode = request.render_mode or "preview"
    return synthesize_audio(request)


@app.post("/v1/tts/pronunciation-test", response_model=TtsSynthesizeResponse)
def tts_pronunciation_test(
    request: TtsSynthesizeRequest,
    _: None = Depends(verify_token),
) -> TtsSynthesizeResponse:
    from app.services.tts_synthesizer import synthesize_audio

    request.profile = request.profile or AudioProfile()
    request.profile.watermark = False
    request.profile.format = "mp3"
    request.profile.sample_rate = 16000
    request.profile.channels = 1
    request.profile.max_duration_seconds = 12
    request.music_track_id = "none"
    request.render_mode = "pronunciation_test"
    return synthesize_audio(request)


@app.post("/v1/tts/final", response_model=TtsSynthesizeResponse)
def tts_final(
    request: TtsSynthesizeRequest,
    _: None = Depends(verify_token),
) -> TtsSynthesizeResponse:
    from app.services.tts_synthesizer import synthesize_audio

    request.profile = request.profile or AudioProfile()
    request.profile.watermark = False
    request.profile.format = "wav"
    request.profile.sample_rate = 16000
    request.profile.channels = 2
    request.profile.max_duration_seconds = max(request.profile.max_duration_seconds or 40, 40)
    request.render_mode = "final"
    return synthesize_audio(request)


@app.post("/v1/business/analyze", response_model=BusinessAnalyzeResponse)
def business_analyze(
    request: BusinessAnalyzeRequest,
    _: None = Depends(verify_token),
) -> BusinessAnalyzeResponse:
    return analyze_business(request)


@app.post("/v1/script/generate", response_model=ScriptGenerateResponse)
def script_generate(
    request: ScriptGenerateRequest,
    _: None = Depends(verify_token),
) -> ScriptGenerateResponse:
    return generate_script(request)


@app.post("/v1/script/generate/async")
def script_generate_async(
    request: ScriptGenerateRequest,
    _: None = Depends(verify_token),
) -> dict[str, str]:
    from redis import Redis
    from rq import Queue

    from app.config import REDIS_URL
    from app.tasks import enqueue_script_generation

    redis_conn = Redis.from_url(REDIS_URL)
    queue = Queue("beat_script", connection=redis_conn)
    job = queue.enqueue(enqueue_script_generation, request.model_dump())
    return {"job_id": job.id, "status": "queued"}
