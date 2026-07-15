#!/usr/bin/env python3
"""CLI smoke test for MMS-TTS on the worker host."""

from __future__ import annotations

import argparse
import base64
from pathlib import Path

from app.schemas.audio import AudioProfile, TtsSynthesizeRequest
from app.services.tts_synthesizer import synthesize_audio


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate a sample BizTune TTS clip")
    parser.add_argument("--text", default="Karibu BizTune, huduma bora ya caller tune.")
    parser.add_argument("--voice", default="mms-swh-default")
    parser.add_argument("--output", default="sample-preview.mp3")
    parser.add_argument("--final", action="store_true", help="Generate HQ WAV instead of watermarked preview")
    args = parser.parse_args()

    profile = AudioProfile(
        format="wav" if args.final else "mp3",
        sample_rate=44100 if args.final else 22050,
        watermark=not args.final,
    )

    result = synthesize_audio(
        TtsSynthesizeRequest(
            subscription_id=0,
            text=args.text,
            voice_id=args.voice,
            profile=profile,
        )
    )

    if not result.success or result.audio is None:
        raise SystemExit(result.message or "TTS failed")

    output = Path(args.output)
    output.write_bytes(base64.b64decode(result.audio.content_base64))
    print(f"Wrote {output} ({result.audio.duration_seconds}s, {result.audio.format})")


if __name__ == "__main__":
    main()
