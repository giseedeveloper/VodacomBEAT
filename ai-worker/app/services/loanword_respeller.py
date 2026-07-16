"""English loanword → Tanzanian-Swahili phonetic respelling for TTS.

Azure sw-TZ (and MMS) voices read Swahili orthography natively, but force-read
embedded English words ("Solution", "Sky") with broken pronunciation. We respell
those words the way a Tanzanian speaker actually says them ("Solusheni", "Skai")
before synthesis. Customer-provided pronunciation hints always take precedence.
"""

from __future__ import annotations

import re

# Curated respellings — Swahili orthography of common TZ business English.
# Keys are matched case-insensitively on word boundaries.
LOANWORD_RESPELLINGS: dict[str, str] = {
    # Multi-word phrases first (applied before single words by length sort)
    "spare parts": "spea pati",
    "cash point": "kashi pointi",
    "money point": "mani pointi",
    "one stop": "wani stopu",
    # Commerce / shop types
    "solution": "solusheni",
    "solutions": "solusheni",
    "pharmacy": "famasi",
    "boutique": "butiki",
    "supermarket": "supamaketi",
    "minimarket": "minimaketi",
    "salon": "saluni",
    "saloon": "saluni",
    "barbershop": "babashopu",
    "butchery": "buchari",
    "stationery": "stesheneri",
    "stationary": "stesheneri",
    "hardware": "hadiwea",
    "electronics": "elektroniki",
    "electronic": "elektroniki",
    "cosmetics": "kosmetiki",
    "collection": "koleksheni",
    "collections": "koleksheni",
    "fashion": "fasheni",
    "designer": "dizaina",
    "designers": "dizaina",
    "design": "dizaini",
    "designs": "dizaini",
    "garage": "gereji",
    "motors": "mota",
    "motor": "mota",
    "auto": "oto",
    "spare": "spea",
    "spares": "spea",
    "cashpoint": "kashi pointi",
    "investment": "investimenti",
    "investments": "investimenti",
    "enterprises": "entapraizi",
    "enterprise": "entapraizi",
    "company": "kampuni",
    "traders": "treda",
    "trader": "treda",
    "suppliers": "saplaya",
    "supplier": "saplaya",
    "supplies": "saplai",
    "agency": "ejensi",
    "agencies": "ejensi",
    "services": "savisi",
    "service": "savisi",
    "store": "stoo",
    "stores": "stoo",
    "shop": "shopu",
    "shopping": "shopingi",
    "mart": "mati",
    "center": "senta",
    "centre": "senta",
    "point": "pointi",
    "plaza": "plaza",
    "express": "ekspresi",
    "general": "jenerali",
    "group": "grupu",
    "limited": "limitedi",
    # Tech / digital
    "computer": "kompyuta",
    "computers": "kompyuta",
    "mobile": "mobaili",
    "phone": "foni",
    "phones": "foni",
    "smartphone": "smatifoni",
    "internet": "intaneti",
    "online": "onlaini",
    "digital": "dijitali",
    "network": "netiwaki",
    "smart": "smati",
    "accessories": "aksesari",
    "accessory": "aksesari",
    # Marketing words
    "delivery": "delivari",
    "order": "oda",
    "orders": "oda",
    "offer": "ofa",
    "offers": "ofa",
    "discount": "diskaunti",
    "quality": "kwaliti",
    "fresh": "freshi",
    "classic": "klasiki",
    "best": "besti",
    "top": "topu",
    "star": "staa",
    "king": "kingi",
    "queen": "kwini",
    "city": "siti",
    "sky": "skai",
    "net": "neti",
    "one": "wani",
    "beauty": "byuti",
    "style": "staili",
    "styles": "staili",
    # Common place/word fixes
    "station": "stesheni",
    "market": "maketi",
    "cash": "kashi",
    "money": "mani",
    "care": "kea",
    "health": "helthi",
    "clinic": "kliniki",
    "medical": "medikali",
    "school": "skuli",
    "academy": "akademia",
    "college": "koleji",
}

# Words ending in -tion not in the dictionary: promotion → promosheni etc.
_TION_SUFFIX = re.compile(r"\b([A-Za-z]{3,})tions?\b")

# Swahili text is fully covered by these letters/digraphs; a word with rare
# English-only patterns (q, x, double consonants like "ss", "tt") is likely English.
_WORD_RE = re.compile(r"\b[A-Za-z]{2,}\b")


def _tion_respell(word: str) -> str:
    """promotion → promosheni, action → aksheni (approximation)."""
    stem = re.sub(r"tions?$", "", word, flags=re.IGNORECASE)
    return f"{stem.lower()}sheni"


def generate_loanword_hints(text: str) -> list[dict[str, str]]:
    """Build pronunciation hints for English loanwords found in the script."""
    if not text:
        return []

    hints: list[dict[str, str]] = []
    seen: set[str] = set()

    lower_text = text.lower()

    # Dictionary matches (phrases first — longest keys win inside apply_pronunciation)
    for key, respelled in LOANWORD_RESPELLINGS.items():
        if key in seen:
            continue
        pattern = re.compile(r"\b" + re.escape(key) + r"\b", re.IGNORECASE)
        if pattern.search(text):
            hints.append({"word": key, "hint": respelled})
            seen.add(key)

    # -tion/-tions fallback for words not covered above
    for match in _TION_SUFFIX.finditer(text):
        word = match.group(0)
        key = word.lower()
        if key in seen or key in LOANWORD_RESPELLINGS:
            continue
        # Skip if any dictionary phrase already covers this word
        if any(key in dict_key for dict_key in seen):
            continue
        hints.append({"word": word, "hint": _tion_respell(word)})
        seen.add(key)

    return hints


def merge_hints(
    auto_hints: list[dict[str, str]],
    customer_hints: list[dict[str, str]],
) -> list[dict[str, str]]:
    """Customer hints always override auto respellings for the same word."""
    customer_words = {
        str(hint.get("word") or "").strip().lower()
        for hint in customer_hints
        if hint.get("word")
    }
    filtered_auto = [
        hint
        for hint in auto_hints
        if str(hint.get("word") or "").strip().lower() not in customer_words
    ]
    # Auto first, customer last — later entries win in providers' mapping loops
    return filtered_auto + customer_hints
