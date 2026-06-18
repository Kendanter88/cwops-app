"""One-time: turn the original W1AW certificate PDFs into blank templates.

Redacts the dynamic regions (recipient name, date, advisor signature + name)
so no sample data ("Hiram P Maxim") is stored on the server. The fixed parts
(title, level word, managers block + their signatures, borders, logo) stay.

Reads the originals from the local workbench (NOT committed) and writes
blank-<level>.pdf into certs/assets/templates/. Re-run only if the source
templates change.

    python certs/_make_blanks.py
"""
import sys
from pathlib import Path

import fitz  # PyMuPDF

SRC = Path(r"C:\Scripts\workbench\cwops")
OUT = Path(__file__).parent / "assets" / "templates"
LEVELS = {"beg": "beginner", "fun": "fundamental", "int": "intermediate", "adv": "advanced"}

# Dynamic regions to white out (shared by all four templates).
REDACT = [
    (180, 178, 560, 219),  # recipient name + callsign
    (278, 447, 432, 471),  # date / semester
    (58, 381, 242, 405),   # advisor handwritten signature (dropped)
    (53, 404, 247, 427),   # advisor printed name + callsign
]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for short, full in LEVELS.items():
        src = SRC / f"w1aw.{short}.pdf"
        if not src.exists():
            print(f"  SKIP {full}: {src} not found")
            continue
        doc = fitz.open(src)
        pg = doc[0]
        for r in REDACT:
            pg.add_redact_annot(fitz.Rect(*r), fill=(1, 1, 1))
        pg.apply_redactions()
        dest = OUT / f"blank-{full}.pdf"
        doc.save(dest, garbage=4, deflate=True)
        doc.close()
        print(f"  wrote {dest.name}")


if __name__ == "__main__":
    main()
