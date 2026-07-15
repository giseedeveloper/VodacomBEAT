"""Lightweight local TTS fallback (macOS `say` / espeak) when MMS/torch is unavailable."""

from __future__ import annotations

import logging
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

from app.services.tts.base import SynthesisResult, TtsProvider, VoiceInfo

logger = logging.getLogger(__name__)


def _available_say_voices() -> set[str]:
    if not shutil.which("say"):
        return set()
    try:
        out = subprocess.run(["say", "-v", "?"], check=True, capture_output=True, text=True)
    except Exception:
        return set()
    voices: set[str] = set()
    for line in out.stdout.splitlines():
        parts = line.split()
        if parts:
            voices.add(parts[0])
    return voices


def _pick_macos_voice(voice_id: str, available: set[str]) -> str:
    """Prefer voices that handle Bantu/Austronesian phonetics better than US English."""
    want_male = "male" in voice_id.lower() and "female" not in voice_id.lower()
    # Damayanti (Indonesian) / Amira (Malay) tend to pronounce Swahili more clearly than Samantha.
    female_prefs = ["Damayanti", "Amira", "Samantha", "Karen", "Moira", "Fiona"]
    male_prefs = ["Aman", "Daniel", "Albert", "Fred", "Alex", "Oliver"]
    prefs = male_prefs if want_male else female_prefs
    for name in prefs:
        if name in available:
            return name
    # Any available voice as last resort
    if available:
        return sorted(available)[0]
    return "Samantha"


def _speakable_text(text: str) -> str:
    """Make phone numbers and punctuation easier for system TTS to read aloud."""
    cleaned = text.strip()
    # Expand long digit runs so the voice actually reads them
    def expand_number(match: re.Match[str]) -> str:
        digits = match.group(0)
        return " ".join(digits)

    cleaned = re.sub(r"\b\d{7,}\b", expand_number, cleaned)
    cleaned = cleaned.replace(",", ", ")
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned


class LocalFallbackTtsAdapter(TtsProvider):
    """Dev/local preview voice — not for production quality."""

    def __init__(self) -> None:
        self._voices = [
            VoiceInfo(
                id="local-female",
                label="Preview Female (local)",
                language="sw-TZ",
                gender="female",
                provider="local_fallback",
                model_id="macos-say",
                is_finetuned=False,
                license_note="Local Mac voice — Swahili accent is approximate until MMS is deployed",
            ),
            VoiceInfo(
                id="local-male",
                label="Preview Male (local)",
                language="sw-TZ",
                gender="male",
                provider="local_fallback",
                model_id="macos-say",
                is_finetuned=False,
                license_note="Local Mac voice — Swahili accent is approximate until MMS is deployed",
            ),
            VoiceInfo(
                id="mms-swh-default",
                label="Kiswahili Preview (local)",
                language="sw-TZ",
                gender="neutral",
                provider="local_fallback",
                model_id="macos-say",
                is_finetuned=False,
                license_note="Local fallback — deploy Docker MMS for real Kiswahili TTS",
            ),
        ]

    def list_voices(self) -> list[VoiceInfo]:
        return list(self._voices)

    def synthesize(
        self,
        text: str,
        voice_id: str,
        speaking_rate: float = 1.0,
        pronunciation_hints: list[dict[str, str]] | None = None,
    ) -> SynthesisResult:
        normalized = _speakable_text(text)
        if not normalized:
            raise ValueError("Script text is empty")

        if pronunciation_hints:
            for hint in pronunciation_hints:
                word = (hint.get("word") or "").strip()
                replacement = (hint.get("hint") or "").strip()
                if word and replacement:
                    normalized = re.sub(re.escape(word), replacement, normalized, flags=re.IGNORECASE)

        rate = max(0.5, min(2.0, speaking_rate or 1.0))
        logger.info("Local TTS speaking (%s chars) voice_id=%s: %s", len(normalized), voice_id, normalized[:120])

        with tempfile.TemporaryDirectory() as tmp:
            out_wav = Path(tmp) / "speech.wav"
            if shutil.which("say"):
                self._synthesize_macos(normalized, voice_id, rate, out_wav)
            elif shutil.which("espeak") or shutil.which("espeak-ng"):
                self._synthesize_espeak(normalized, voice_id, rate, out_wav)
            else:
                raise RuntimeError(
                    "No local TTS available. Install Meta MMS (torch) or ensure macOS `say` / espeak is installed."
                )

            wav_bytes = out_wav.read_bytes()
            if len(wav_bytes) < 1000:
                raise RuntimeError("Local TTS produced empty audio — check macOS `say` voice availability")

            duration = self._probe_duration(out_wav)
            return SynthesisResult(
                pcm_wav_bytes=wav_bytes,
                sample_rate=22050,
                duration_seconds=duration,
            )

    def _synthesize_macos(self, text: str, voice_id: str, rate: float, out_wav: Path) -> None:
        available = _available_say_voices()
        voice = _pick_macos_voice(voice_id, available)
        # Slower rate helps Swahili intelligibility on non-Swahili system voices
        words_per_min = int(145 * rate)
        aiff = out_wav.with_suffix(".aiff")
        logger.info("Using macOS say voice=%s rate=%s", voice, words_per_min)
        completed = subprocess.run(
            ["say", "-v", voice, "-r", str(words_per_min), "-o", str(aiff), text],
            capture_output=True,
            text=True,
        )
        if completed.returncode != 0 or not aiff.exists():
            raise RuntimeError(f"macOS say failed ({voice}): {completed.stderr or completed.stdout}")

        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-hide_banner",
                "-loglevel",
                "error",
                "-i",
                str(aiff),
                "-ar",
                "22050",
                "-ac",
                "1",
                str(out_wav),
            ],
            check=True,
            capture_output=True,
        )

    def _synthesize_espeak(self, text: str, voice_id: str, rate: float, out_wav: Path) -> None:
        binary = "espeak-ng" if shutil.which("espeak-ng") else "espeak"
        voice = "sw+f2" if "female" in voice_id.lower() else "sw"
        speed = int(130 * rate)
        subprocess.run(
            [binary, "-v", voice, "-s", str(speed), "-w", str(out_wav), text],
            check=True,
            capture_output=True,
        )

    def _probe_duration(self, path: Path) -> float:
        try:
            completed = subprocess.run(
                [
                    "ffprobe",
                    "-v",
                    "error",
                    "-show_entries",
                    "format=duration",
                    "-of",
                    "default=noprint_wrappers=1:nokey=1",
                    str(path),
                ],
                check=True,
                capture_output=True,
                text=True,
            )
            return round(float(completed.stdout.strip()), 2)
        except Exception:
            return 0.0
