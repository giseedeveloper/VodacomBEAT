"""BEAT AI worker configuration."""

from __future__ import annotations

import os
from pathlib import Path

try:
    from dotenv import load_dotenv

    # Prefer repo-root .env (Laravel), then local ai-worker/.env
    root_env = Path(__file__).resolve().parents[2] / ".env"
    local_env = Path(__file__).resolve().parents[1] / ".env"
    if root_env.exists():
        load_dotenv(root_env, override=False)
    if local_env.exists():
        load_dotenv(local_env, override=False)
except Exception:
    pass


def env(key: str, default: str = "") -> str:
    return os.getenv(key, default)


REDIS_URL = env("REDIS_URL", "redis://redis:6379/0")
INTERNAL_TOKEN = env("BEAT_AI_WORKER_TOKEN", "")

LLM_BASE_URL = env("BEAT_LLM_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai/")
LLM_API_KEY = env("BEAT_LLM_API_KEY", "") or env("GEMINI_API_KEY", "")
LLM_MODEL = env("BEAT_LLM_MODEL", "gemini-flash-lite-latest")

GEMINI_API_KEY = env("GEMINI_API_KEY", "") or env("BEAT_LLM_API_KEY", "")
GEMINI_MODEL = env("GEMINI_MODEL", "gemini-flash-lite-latest")
GEMINI_BASE_URL = env("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta")

AZURE_SPEECH_KEY = env("AZURE_SPEECH_KEY", "")
AZURE_SPEECH_REGION = env("AZURE_SPEECH_REGION", "eastus")

DEFAULT_LANGUAGE = env("BEAT_SCRIPT_DEFAULT_LANGUAGE", "sw-TZ")
MAX_DURATION_SECONDS = int(env("BEAT_SCRIPT_MAX_DURATION_SECONDS", "40"))

# azure | mms | local — azure preferred for production sw-TZ quality
TTS_PROVIDER = env("BEAT_TTS_PROVIDER", "azure")
VOICES_MANIFEST_PATH = env("BEAT_VOICES_MANIFEST", "/app/voices/manifest.json")
DEFAULT_VOICE_ID = env("BEAT_DEFAULT_VOICE_ID", "daudi-professional")
MMS_MODEL_ID = env("BEAT_MMS_MODEL_ID", "facebook/mms-tts-swh")
HF_HOME = env("HF_HOME", "/root/.cache/huggingface")
