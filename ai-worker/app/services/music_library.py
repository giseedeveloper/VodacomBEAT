"""Background music track catalog with category recommendations."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from pydantic import BaseModel, Field

MUSIC_DIR = Path(__file__).resolve().parents[2] / "music"
MANIFEST_PATH = MUSIC_DIR / "manifest.json"


class MusicTrack(BaseModel):
    id: str
    label: str
    mood: str = "calm"
    file: str | None = None
    category: str | None = None
    recommended_for: list[str] = Field(default_factory=list)
    intro_duration_ms: int = 1500
    outro_duration_ms: int = 4000
    default_volume: float = 0.18


@lru_cache(maxsize=1)
def list_music_tracks() -> list[MusicTrack]:
    if not MANIFEST_PATH.exists():
        return [MusicTrack(id="none", label="No Music", mood="none", file=None)]
    payload = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    return [MusicTrack(**item) for item in payload.get("tracks", [])]


def resolve_music_path(track_id: str | None) -> Path | None:
    if not track_id or track_id == "none":
        return None
    for track in list_music_tracks():
        if track.id == track_id and track.file:
            path = MUSIC_DIR / track.file
            if path.exists():
                return path
    return None


def recommend_track_for_category(category: str | None) -> str:
    if not category:
        return "warm_pad"
    for track in list_music_tracks():
        if category in (track.recommended_for or []):
            return track.id
    return "warm_pad"
