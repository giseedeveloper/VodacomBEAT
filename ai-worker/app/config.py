"""BEAT AI worker configuration."""

from __future__ import annotations

import os


def env(key: str, default: str = "") -> str:
    return os.getenv(key, default)


REDIS_URL = env("REDIS_URL", "redis://redis:6379/0")
INTERNAL_TOKEN = env("BEAT_AI_WORKER_TOKEN", "")

LLM_BASE_URL = env("BEAT_LLM_BASE_URL", "https://api.openai.com/v1")
LLM_API_KEY = env("BEAT_LLM_API_KEY", "")
LLM_MODEL = env("BEAT_LLM_MODEL", "gpt-4o-mini")

DEFAULT_LANGUAGE = env("BEAT_SCRIPT_DEFAULT_LANGUAGE", "sw-TZ")
MAX_DURATION_SECONDS = int(env("BEAT_SCRIPT_MAX_DURATION_SECONDS", "30"))

TTS_PROVIDER = env("BEAT_TTS_PROVIDER", "mms")
VOICES_MANIFEST_PATH = env("BEAT_VOICES_MANIFEST", "/app/voices/manifest.json")
DEFAULT_VOICE_ID = env("BEAT_DEFAULT_VOICE_ID", "mms-swh-default")
MMS_MODEL_ID = env("BEAT_MMS_MODEL_ID", "facebook/mms-tts-swh")
HF_HOME = env("HF_HOME", "/root/.cache/huggingface")
