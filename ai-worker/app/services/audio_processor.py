"""FFmpeg voice production engine — mix calibrated to manual studio sample (Chaz)."""

from __future__ import annotations

import logging
import subprocess
import tempfile
from pathlib import Path

from app.services.audio_render_profile import AudioRenderProfile, profile_from_request

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
    music_volume: float | None = None,
    render_name: str | None = None,
) -> tuple[bytes, float]:
    profile = profile_from_request(
        sample_rate=sample_rate,
        channels=channels,
        output_format=output_format,
        max_duration_seconds=max_duration_seconds,
        watermark=watermark,
        render_name=render_name,
    )
    if music_volume is not None:
        profile.music_volume = music_volume

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        voice_raw = tmp_path / "voice_raw.wav"
        mixed = tmp_path / "mixed.wav"
        output_file = tmp_path / f"output.{profile.output_format}"
        voice_raw.write_bytes(wav_bytes)

        working = voice_raw
        if music_path and Path(music_path).exists() and profile.music_volume > 0:
            _mix_voice_and_music(voice_raw, Path(music_path), mixed, profile)
            working = mixed
        else:
            _process_voice_only(voice_raw, mixed, profile)
            working = mixed

        _export(working, output_file, profile)

        if not output_file.exists():
            raise RuntimeError("FFmpeg did not produce output audio")

        duration = _probe_duration(output_file)
        return output_file.read_bytes(), duration


def _mix_voice_and_music(
    voice_path: Path,
    music_path: Path,
    output_path: Path,
    profile: AudioRenderProfile,
) -> None:
    """
    Community-standard TTS bed mix (FFmpeg cookbook / sidechain ducking):
    music intro → delayed voice → sidechain duck music under speech → outro → loudnorm.

    Pattern: voice asplit → sidechaincompress(music, voice_sc) → amix(ducked, voice).
    """
    delay = max(0, int(profile.intro_delay_ms))
    total = float(profile.maximum_duration_seconds)
    outro_start = max(0.5, total - (profile.outro_duration_ms / 1000.0))
    outro_dur = max(0.5, profile.outro_duration_ms / 1000.0)
    sr = int(profile.sample_rate)
    ch_layout = "stereo" if int(profile.channels) >= 2 else "mono"
    # Keep bed clearly audible but under voice (community guidance: ~15–25%)
    bed_vol = max(0.08, min(0.35, float(profile.music_volume or 0.2)))

    filter_complex = (
        f"[0:a]aformat=sample_fmts=fltp:sample_rates={sr}:channel_layouts={ch_layout},"
        f"highpass=f={profile.voice_highpass_hz},"
        f"lowpass=f={profile.voice_lowpass_hz},"
        f"acompressor=threshold={profile.compressor_threshold_db}dB:"
        f"ratio={profile.compressor_ratio}:attack=15:release=150,"
        f"adelay={delay}|{delay},"
        f"asplit=2[sc][voice];"
        f"[1:a]aformat=sample_fmts=fltp:sample_rates={sr}:channel_layouts={ch_layout},"
        f"atrim=0:{total},"
        f"asetpts=PTS-STARTPTS,"
        f"volume={bed_vol},"
        f"afade=t=in:st=0:d={profile.fade_in_seconds},"
        f"afade=t=out:st={outro_start}:d={outro_dur}"
        f"[music];"
        f"[music][sc]sidechaincompress="
        f"threshold={profile.ducking_threshold}:"
        f"ratio={profile.ducking_ratio}:"
        f"attack={profile.ducking_attack_ms}:"
        f"release={profile.ducking_release_ms}:"
        f"knee=6:"
        f"makeup=1"
        f"[ducked];"
        f"[ducked][voice]amix=inputs=2:duration=longest:dropout_transition=0:normalize=0,"
        f"loudnorm=I={profile.target_loudness_lufs}:TP={profile.true_peak_db}:LRA={profile.loudness_range}"
        f"[final]"
    )

    cmd = [
        "ffmpeg",
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        str(voice_path),
        "-stream_loop",
        "-1",
        "-i",
        str(music_path),
        "-filter_complex",
        filter_complex,
        "-map",
        "[final]",
        "-t",
        str(total),
        "-ar",
        str(profile.sample_rate),
        "-ac",
        str(profile.channels),
        "-c:a",
        "pcm_s16le",
        str(output_path),
    ]
    _run(cmd)


def _process_voice_only(voice_path: Path, output_path: Path, profile: AudioRenderProfile) -> None:
    loudnorm = (
        f"loudnorm=I={profile.target_loudness_lufs}:TP={profile.true_peak_db}:LRA={profile.loudness_range}"
    )
    if profile.watermark:
        af = f"highpass=f={profile.voice_highpass_hz},volume=0.92,afade=t=in:st=0:d=0.2,{loudnorm}"
    else:
        af = (
            f"highpass=f={profile.voice_highpass_hz},"
            f"lowpass=f={profile.voice_lowpass_hz},"
            f"acompressor=threshold={profile.compressor_threshold_db}dB:"
            f"ratio={profile.compressor_ratio}:attack=15:release=150,"
            f"{loudnorm}"
        )
    cmd = [
        "ffmpeg",
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        str(voice_path),
        "-af",
        af,
        "-t",
        str(profile.maximum_duration_seconds),
        "-ar",
        str(profile.sample_rate),
        "-ac",
        str(profile.channels),
        "-c:a",
        "pcm_s16le",
        str(output_path),
    ]
    _run(cmd)


def _export(working: Path, output_file: Path, profile: AudioRenderProfile) -> None:
    if profile.output_format == "mp3":
        cmd = [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            str(working),
            "-t",
            str(profile.maximum_duration_seconds),
            "-ar",
            str(profile.sample_rate),
            "-ac",
            str(profile.channels),
            "-codec:a",
            "libmp3lame",
            "-b:a",
            "96k",
            str(output_file),
        ]
    else:
        # already wav pcm — re-encode to guarantee profile
        cmd = [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            str(working),
            "-t",
            str(profile.maximum_duration_seconds),
            "-ar",
            str(profile.sample_rate),
            "-ac",
            str(profile.channels),
            "-c:a",
            "pcm_s16le",
            str(output_file),
        ]
    _run(cmd)


def _run(cmd: list[str]) -> None:
    completed = subprocess.run(cmd, capture_output=True, text=True)
    if completed.returncode != 0:
        logger.error("ffmpeg failed: %s", completed.stderr[-800:])
        raise RuntimeError(f"FFmpeg failed: {completed.stderr[-300:]}")


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


def validate_audio_file(path: Path, profile: AudioRenderProfile) -> dict:
    """Lightweight QA against render profile / Chaz baseline."""
    duration = _probe_duration(path)
    probe = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "a:0",
            "-show_entries",
            "stream=sample_rate,channels",
            "-of",
            "json",
            str(path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    import json

    data = json.loads(probe.stdout or "{}")
    stream = (data.get("streams") or [{}])[0]
    sample_rate = int(stream.get("sample_rate") or 0)
    channels = int(stream.get("channels") or 0)
    size = path.stat().st_size if path.exists() else 0

    problems: list[str] = []
    if duration <= 0.5:
        problems.append("Audio too short / possibly silent")
    if duration > profile.maximum_duration_seconds + 1.5:
        problems.append(f"Duration {duration}s exceeds limit {profile.maximum_duration_seconds}s")
    if sample_rate and sample_rate != profile.sample_rate:
        problems.append(f"Sample rate {sample_rate} != {profile.sample_rate}")
    if channels and channels != profile.channels:
        problems.append(f"Channels {channels} != {profile.channels}")
    if size < 2000:
        problems.append("File size suspiciously small")

    return {
        "duration_seconds": duration,
        "sample_rate": sample_rate,
        "channels": channels,
        "file_size_bytes": size,
        "passed": not problems,
        "problems": problems,
    }
