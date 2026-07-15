"""Short audible bed samples for the music picker UI."""

from __future__ import annotations

import logging
import subprocess
import tempfile
from pathlib import Path

from fastapi import HTTPException
from fastapi.responses import Response

from app.services.music_library import resolve_music_path

logger = logging.getLogger(__name__)

PREVIEW_SECONDS = 10


def render_music_preview(track_id: str, seconds: float = PREVIEW_SECONDS) -> Response:
    if track_id in ("", "none"):
        raise HTTPException(status_code=404, detail="No preview for this track")

    path = resolve_music_path(track_id)
    if path is None or not path.exists():
        raise HTTPException(status_code=404, detail=f"Music track not found: {track_id}")

    seconds = max(3.0, min(15.0, float(seconds)))
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "preview.mp3"
        cmd = [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-stream_loop",
            "-1",
            "-i",
            str(path),
            "-t",
            str(seconds),
            "-af",
            "volume=0.55,afade=t=in:st=0:d=0.4,afade=t=out:st=%.1f:d=0.8" % (seconds - 0.8),
            "-ar",
            "22050",
            "-ac",
            "1",
            "-codec:a",
            "libmp3lame",
            "-b:a",
            "96k",
            str(out),
        ]
        try:
            subprocess.run(cmd, check=True, capture_output=True)
        except subprocess.CalledProcessError as exc:
            logger.error("music preview ffmpeg failed: %s", exc.stderr.decode(errors="ignore")[:400])
            raise HTTPException(status_code=500, detail="Failed to render music preview") from exc

        data = out.read_bytes()

    return Response(
        content=data,
        media_type="audio/mpeg",
        headers={
            "Cache-Control": "public, max-age=86400",
            "Content-Disposition": f'inline; filename="{track_id}-preview.mp3"',
        },
    )
