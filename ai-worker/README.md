# BEAT AI Worker

Python 3.11 service for LLM script generation and **self-hosted MMS-TTS** (no Azure).

## Stack

- **FastAPI** — HTTP API called by Laravel
- **Meta MMS-TTS** — default voice (`facebook/mms-tts-swh`)
- **Redis + RQ** — optional async jobs
- **FFmpeg** — preview watermark, loudness, format conversion

## TTS endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/v1/tts/voices` | List configured voices |
| POST | `/v1/tts/preview` | Watermarked MP3 preview |
| POST | `/v1/tts/final` | HQ WAV for installation export |
| POST | `/v1/tts/synthesize` | Generic synthesis with custom profile |

## Voices

Configured in `voices/manifest.json`:

- `mms-swh-default` — active now (dev/staging)
- `biztune-female-v1` / `biztune-male-v1` — enable after fine-tune (see `FINETUNE.md`)

Mount fine-tuned checkpoints at `./models/` on the VPS.

## Smoke test

```bash
docker exec -it beat-ai-worker python scripts/test_tts.py --text "Karibu BizTune"
docker exec -it beat-ai-worker python scripts/test_tts.py --final --output /tmp/final.wav
```

## Docker (production stack)

```bash
docker compose -f docker-compose.prod.fast.yml up -d --build redis ai-worker api-queue
```

First run downloads the MMS model into the `beat_hf_cache` volume (~300MB).

## Laravel integration

- `BeatAudioService` calls `/v1/tts/preview` and `/v1/tts/final`
- Admin routes under `/api/v1/management/tunes/...`
- Audio stored privately in `storage/app/private/beat/{subscription_id}/`
