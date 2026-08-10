#!/usr/bin/env python3
"""Bake the self-hosted Latin webfonts (public/fonts/*-v1.woff2).

Companion to subset_font.py (the CJK corpus subset): chase-100 session #2 found the
Google-Fonts round-trips (css2 stylesheet on fonts.googleapis + woff2s on fonts.gstatic —
DNS + TLS + CSS fetch before any font byte) were what still gated first-paint readiness
after the CJK fix. Same-origin fonts drop that whole chain, and index.html preloads the
two first-paint-critical files (Cinzel + Hanken roman) directly.

Recipe (sizes: Cinzel 29KB, Hanken 47KB, Hanken-Italic 50KB — near Google's own serving
weight, but one origin and zero stylesheet round-trip):
- keep each family VARIABLE but limit the wght axis to what the site renders
  (Cinzel 400–600 for the masthead; Hanken 400–700 incl. font-medium/semibold/bold);
- subset Hanken to the site's actual Latin corpus (swept from src/ + index.html, always
  including printable ASCII + Latin-1 for search-box input) — pinyin tone marks ride in
  via the corpus sweep;
- subset Cinzel to A–Z/a–z/digits/basic punctuation only: it renders three short
  masthead/footer strings (the Greek ΟΔΥΣΣΕΙΑ was never Cinzel — the font has no Greek,
  it has always rendered in the serif fallback).

Sources (google/fonts repo, OFL):
  ofl/cinzel/Cinzel[wght].ttf
  ofl/hankengrotesk/HankenGrotesk[wght].ttf
  ofl/hankengrotesk/HankenGrotesk-Italic[wght].ttf

Usage:
  .venv/bin/python scripts/subset_latin_fonts.py <dir-with-the-3-ttfs>

If the subset ever changes, bump -v1 in FILES below AND in index.html's preloads and
src/index.css's @font-face urls — public/fonts/ is served with immutable caching.
"""

import string
import sys
from io import BytesIO
from pathlib import Path

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "fonts"

CINZEL_CPS = {ord(c) for c in string.ascii_letters + string.digits + " .,:;'&-·—–’"}

# (source ttf, output name, charset key, wght min, wght max)
FILES = [
    ("Cinzel[wght].ttf", "cinzel-var-v1.woff2", "cinzel", 400, 600),
    ("HankenGrotesk[wght].ttf", "hanken-var-v1.woff2", "corpus", 400, 700),
    ("HankenGrotesk-Italic[wght].ttf", "hanken-italic-var-v1.woff2", "corpus", 400, 700),
]


def corpus_codepoints() -> set[int]:
    cps: set[int] = set()
    for p in list((ROOT / "src").rglob("*")) + [ROOT / "index.html"]:
        if p.suffix not in {".json", ".ts", ".tsx", ".css", ".html"}:
            continue
        for ch in p.read_text(encoding="utf-8"):
            if ord(ch) < 0x2E80:  # CJK is subset_font.py's job
                cps.add(ord(ch))
    # user-typable + typographic basics, regardless of current content
    cps |= set(range(0x20, 0x7F)) | set(range(0xA0, 0x100))
    cps |= {0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2026}
    return {c for c in cps if c >= 0x20}


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(f"usage: {sys.argv[0]} <dir containing the 3 source ttfs>")
    src_dir = Path(sys.argv[1])
    charsets = {"cinzel": CINZEL_CPS, "corpus": corpus_codepoints()}
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for src_name, out_name, charset, wmin, wmax in FILES:
        font = TTFont(str(src_dir / src_name))
        instantiateVariableFont(font, {"wght": (wmin, wmax)}, inplace=True)
        # round-trip through bytes: subsetting a freshly-instanced font trips a
        # fontTools lazy-table KeyError on gvar otherwise
        buf = BytesIO()
        font.save(buf)
        buf.seek(0)
        font = TTFont(buf)
        covered = charsets[charset] & set(font.getBestCmap())
        subsetter = Subsetter(Options(flavor="woff2"))
        subsetter.populate(unicodes=sorted(covered))
        subsetter.subset(font)
        out = OUT_DIR / out_name
        font.save(str(out))
        print(f"{out_name}: wght {wmin}–{wmax}, {len(covered)} codepoints "
              f"→ {out.stat().st_size / 1024:.0f}KB")


if __name__ == "__main__":
    main()
