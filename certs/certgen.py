"""Render a CW Academy completion certificate.

Overlays the recipient (name + callsign), the session date, and the advisor
(name + callsign) onto the blank template for a given level, matching the
template's Garamond Bold. Returns PDF bytes.

    from certs.certgen import generate, LEVELS
    pdf_bytes = generate("fundamental", "John Q Public", "K1ABC",
                         "Sep/Oct 2026", "Kenny Danter", "AD8CV")
"""
from pathlib import Path

import fitz  # PyMuPDF

ASSETS = Path(__file__).parent / "assets"
FONT_PATH = ASSETS / "GaramondBold.ttf"
TEMPLATES = ASSETS / "templates"

LEVELS = ("beginner", "fundamental", "intermediate", "advanced")
DASH = "–"  # en dash, as on the original certificate

# Overlay placements: (center_x, baseline_y, font_size). Shared by all levels.
_NAME = (360, 209, 32)
_DATE = (353, 464, 18)
_ADVISOR = (148, 421, 18)
_FONT = "garabd"


def _center(page, font, text, size, cx, baseline):
    width = font.text_length(text, fontsize=size)
    page.insert_text((cx - width / 2, baseline), text, fontname=_FONT,
                     fontfile=str(FONT_PATH), fontsize=size, color=(0, 0, 0))


def generate(level, name, callsign, date, advisor_name, advisor_callsign):
    """Return certificate PDF bytes for one recipient.

    level: one of LEVELS. date: pre-formatted string e.g. "Sep/Oct 2026".
    """
    level = (level or "").strip().lower()
    if level not in LEVELS:
        raise ValueError(f"Unknown level: {level!r} (expected one of {LEVELS})")
    template = TEMPLATES / f"blank-{level}.pdf"
    if not template.exists():
        raise FileNotFoundError(f"Missing template {template}")

    doc = fitz.open(template)
    page = doc[0]
    font = fitz.Font(fontfile=str(FONT_PATH))
    page.insert_font(fontname=_FONT, fontfile=str(FONT_PATH))

    recipient = f"{name.strip()} {DASH} {callsign.strip().upper()}"
    _center(page, font, recipient, _NAME[2], _NAME[0], _NAME[1])
    _center(page, font, date.strip(), _DATE[2], _DATE[0], _DATE[1])
    advisor = f"{advisor_name.strip()} {DASH} {advisor_callsign.strip().upper()}"
    _center(page, font, advisor, _ADVISOR[2], _ADVISOR[0], _ADVISOR[1])

    out = doc.tobytes(garbage=4, deflate=True)
    doc.close()
    return out
