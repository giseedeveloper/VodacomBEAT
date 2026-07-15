"""Audio render profiles calibrated against the manual Chaz sample (~39.5s / 16 kHz stereo)."""

from __future__ import annotations

from dataclasses import asdict, dataclass


@dataclass
class AudioRenderProfile:
    """Backend production settings — not exposed as customer knobs."""

    name: str = "caller_tune_manual_ref"
    intro_delay_ms: int = 1500
    outro_duration_ms: int = 4000
    music_volume: float = 0.18
    ducking_threshold: float = 0.025
    ducking_ratio: float = 8.0
    ducking_attack_ms: int = 20
    ducking_release_ms: int = 300
    fade_in_seconds: float = 1.2
    voice_highpass_hz: int = 80
    voice_lowpass_hz: int = 7500
    compressor_threshold_db: float = -18.0
    compressor_ratio: float = 3.0
    target_loudness_lufs: float = -16.0
    true_peak_db: float = -1.5
    loudness_range: float = 7.0
    sample_rate: int = 16000
    channels: int = 2
    bit_depth: int = 16
    maximum_duration_seconds: int = 40
    output_format: str = "wav"
    watermark: bool = False

    def to_dict(self) -> dict:
        return asdict(self)


PREVIEW_PROFILE = AudioRenderProfile(
    name="preview_mixed_short",
    intro_delay_ms=1200,
    outro_duration_ms=2500,
    maximum_duration_seconds=15,
    sample_rate=16000,
    channels=1,
    output_format="mp3",
    watermark=True,
    music_volume=0.16,
)

FINAL_PROFILE = AudioRenderProfile(
    name="caller_tune_manual_ref",
    intro_delay_ms=1500,
    outro_duration_ms=4000,
    maximum_duration_seconds=40,
    sample_rate=16000,
    channels=2,
    output_format="wav",
    watermark=False,
)

VOICE_ONLY_TEST_PROFILE = AudioRenderProfile(
    name="pronunciation_test",
    intro_delay_ms=0,
    outro_duration_ms=0,
    maximum_duration_seconds=12,
    sample_rate=16000,
    channels=1,
    output_format="mp3",
    watermark=False,
    music_volume=0.0,
)


def profile_from_request(
    *,
    sample_rate: int,
    channels: int,
    output_format: str,
    max_duration_seconds: int,
    watermark: bool,
    render_name: str | None = None,
) -> AudioRenderProfile:
    if render_name == "preview" or (watermark and max_duration_seconds <= 20):
        base = PREVIEW_PROFILE
    elif render_name == "pronunciation_test":
        base = VOICE_ONLY_TEST_PROFILE
    else:
        base = FINAL_PROFILE

    return AudioRenderProfile(
        name=base.name,
        intro_delay_ms=base.intro_delay_ms,
        outro_duration_ms=base.outro_duration_ms,
        music_volume=base.music_volume,
        ducking_threshold=base.ducking_threshold,
        ducking_ratio=base.ducking_ratio,
        ducking_attack_ms=base.ducking_attack_ms,
        ducking_release_ms=base.ducking_release_ms,
        fade_in_seconds=base.fade_in_seconds,
        voice_highpass_hz=base.voice_highpass_hz,
        voice_lowpass_hz=base.voice_lowpass_hz,
        compressor_threshold_db=base.compressor_threshold_db,
        compressor_ratio=base.compressor_ratio,
        target_loudness_lufs=base.target_loudness_lufs,
        true_peak_db=base.true_peak_db,
        loudness_range=base.loudness_range,
        sample_rate=sample_rate or base.sample_rate,
        channels=channels or base.channels,
        bit_depth=base.bit_depth,
        maximum_duration_seconds=max_duration_seconds or base.maximum_duration_seconds,
        output_format=output_format or base.output_format,
        watermark=watermark,
    )
