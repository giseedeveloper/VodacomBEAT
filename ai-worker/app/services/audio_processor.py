"""FFmpeg-based audio post-processing against configurable output profiles."""

from __future__ import annotations

import logging
import subprocess
import tempfile
from pathlib import Path

logger = logging.getLogger(__name__)


def process_wav_profile(
    wav_bytes: bytes,
    *,
    sample_rate: int,
    channels: int = 1,
    output_format: str = "wav",
    max_duration_seconds: int = 30,
    watermark: bool = False,
    music_path: str | Path | None = None,
    music_volume: float = 0.18,
) -> tuple[bytes, float]:
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        input_file = tmp_path / "input.wav"
        mixed_file = tmp_path / "mixed.wav"
        output_file = tmp_path / f"output.{output_format}"
        input_file.write_bytes(wav_bytes)

        working = input_file
        if music_path and Path(music_path).exists():
            # Duck music under voice: voice at full, music quieter, match voice duration
            subprocess.run(
                [
                    "ffmpeg",
                    "-y",
                    "-hide_banner",
                    "-loglevel",
                    "error",
                    "-i",
                    str(input_file),
                    "-stream_loop",
                    "-1",
                    "-i",
                    str(music_path),
                    "-filter_complex",
                    (
                        f"[1:a]volume={music_volume},afade=t=in:d=0.4[bed];"
                        f"[0:a]volume=1.0[voice];"
                        f"[voice][bed]amix=inputs=2:duration=first:dropout_transition=2"
                    ),
                    "-ar",
                    str(sample_rate),
                    "-ac",
                    str(channels),
                    str(mixed_file),
                ],
                check=True,
                capture_output=True,
            )
            working = mixed_file

        filters: list[str] = []
        if watermark:
            filters.append("volume=0.9,afade=t=in:st=0:d=0.2")
        else:
            filters.append("loudnorm=I=-16:TP=-1.5:LRA=11")

        filter_chain = ",".join(filters) if filters else "anull"

        cmd = [
            "-y",
            "-i",
            str(working),
            "-af",
            filter_chain,
            "-t",
            str(max_duration_seconds),
            "-ar",
            str(sample_rate),
            "-ac",
            str(channels),
        ]

        if output_format == "mp3":
            cmd.extend(["-codec:a", "libmp3lame", "-b:a", "96k", str(output_file)])
        else:
            cmd.extend(["-codec:a", "pcm_s16le", str(output_file)])

        subprocess.run(
            ["ffmpeg", "-hide_banner", "-loglevel", "error", *cmd],
            check=True,
        )

        if not output_file.exists():
            raise RuntimeError("FFmpeg did not produce output audio")

        duration = _probe_duration(output_file)
        return output_file.read_bytes(), duration


def _probe_duration(path: Path) -> float:
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
    try:
        return round(float(completed.stdout.strip()), 2)
    except ValueError:
        return 0.0
