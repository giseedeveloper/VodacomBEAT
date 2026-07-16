"""SSML / pronunciation helpers for Swahili caller-tune TTS."""

from __future__ import annotations

import re
from xml.sax.saxutils import escape

# Global dictionary — extend via Laravel pronunciation_entries later
GLOBAL_PRONUNCIATIONS: dict[str, str] = {
    "M-Pesa": "Em Pesa",
    "Mpesa": "Em Pesa",
    "M Pesa": "Em Pesa",
    "Huawei": "Hua-wei",
    "Tecno": "Tek-no",
    "Infinix": "In-fi-niks",
    "Sumbawanga": "Su-mba-wa-nga",
    "Forowanga": "Fo-ro-wa-nga",
    "Miswala": "Mi-swa-la",
    "Majuba": "Ma-ju-ba",
    "Chaz": "Chaz",
}


def apply_pronunciation(
    text: str,
    hints: list[dict[str, str]] | None = None,
    extra: dict[str, str] | None = None,
) -> str:
    mapping = dict(GLOBAL_PRONUNCIATIONS)
    if extra:
        mapping.update(extra)
    for hint in hints or []:
        word = str(hint.get("word") or "").strip()
        replacement = str(hint.get("hint") or hint.get("replacementText") or "").strip()
        if word and replacement:
            mapping[word] = replacement

    # Longer keys first to avoid partial replacements; word boundaries so
    # "net" never rewrites the inside of "intaneti" after earlier respells.
    for original in sorted(mapping.keys(), key=len, reverse=True):
        pattern = re.compile(r"(?<!\w)" + re.escape(original) + r"(?!\w)", re.IGNORECASE)
        text = pattern.sub(mapping[original], text)
    return text


def split_sentences(text: str) -> list[str]:
    cleaned = re.sub(r"\s+", " ", text.strip())
    if not cleaned:
        return []
    parts = re.split(r"(?<=[.!?،؛])\s+|(?<=\.)\s+", cleaned)
    sentences = [p.strip(" ,;") for p in parts if p and p.strip()]
    return sentences or [cleaned]


def build_azure_ssml(
    script: str,
    *,
    voice_name: str,
    rate_percent: int = -3,
    pitch_percent: int = -2,
    language: str = "sw-TZ",
    hints: list[dict[str, str]] | None = None,
) -> str:
    spoken = apply_pronunciation(script, hints)
    sentences = split_sentences(spoken)
    body_parts: list[str] = []
    for index, sentence in enumerate(sentences):
        body_parts.append(escape(sentence))
        if index < len(sentences) - 1:
            # Natural pause between sentences (manual Chaz pacing)
            pause = "450ms" if index == 0 else "350ms"
            body_parts.append(f'<break time="{pause}"/>')

    inner = "\n      ".join(body_parts)
    return f"""<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="{language}">
  <voice name="{escape(voice_name)}">
    <prosody rate="{rate_percent}%" pitch="{pitch_percent}%" volume="medium">
      {inner}
    </prosody>
  </voice>
</speak>""".strip()
