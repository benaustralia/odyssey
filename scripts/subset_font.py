#!/usr/bin/env python3
"""Bake the self-hosted Noto Sans SC subset (src/assets/noto-sans-sc-subset.woff2).

The output lives in src/assets (NOT public/) on purpose: src/index.css references it
relatively, so Vite content-hashes the filename — regenerating the subset automatically
cache-busts for returning visitors, and Vercel serves /assets/* with immutable caching.

Why this exists (Plan.md "chase-100 research session #2", 2026-08-10): the Google-Fonts
Noto Sans SC stylesheet made every page load pull ~2MB of CJK glyphs across 38
unicode-range chunks — 59% of the whole page — because all 167 entries' Chinese text is
in the prerendered DOM. The site's Chinese corpus is fixed and known at build time
(~860 unique codepoints, rendered only at weight 400), so we subset once and self-host.

Re-run whenever glossary zhName/zhDef text or any other on-page Chinese changes:

    python3 -m venv .venv && .venv/bin/pip install fonttools brotli
    .venv/bin/python scripts/subset_font.py path/to/NotoSansSC-Regular.otf

Source font (not kept in the repo — 8.3MB):
https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/SubsetOTF/SC/NotoSansSC-Regular.otf

The corpus scan sweeps src/ recursively (glossary.json, journeys, plates, any literal
Chinese in components), so new Chinese text anywhere in the app is picked up
automatically. ASCII is excluded — Latin text renders in Hanken Grotesk — but every
codepoint above U+00FF that appears in source is kept, which covers CJK ideographs,
fullwidth punctuation, and the interpunct/dashes used in zh definitions.
"""

import sys
from pathlib import Path

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "assets" / "noto-sans-sc-subset.woff2"


def corpus_codepoints() -> set[int]:
    cps: set[int] = set()
    for p in (ROOT / "src").rglob("*"):
        if p.suffix not in {".json", ".ts", ".tsx", ".css"}:
            continue
        for ch in p.read_text(encoding="utf-8"):
            if ord(ch) > 0xFF:
                cps.add(ord(ch))
    return cps


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(f"usage: {sys.argv[0]} <NotoSansSC-Regular.otf>")
    src = Path(sys.argv[1])

    cps = corpus_codepoints()
    font = TTFont(str(src))
    cmap = font.getBestCmap()
    missing = sorted(cp for cp in cps if cp not in cmap)
    covered = cps - set(missing)
    if missing:
        # Latin diacritics (pinyin) etc. live in other fonts; report, don't fail.
        print(f"note: {len(missing)} codepoints not in source font (rendered by other "
              f"fonts): {', '.join(f'U+{cp:04X}' for cp in missing[:20])}"
              f"{' …' if len(missing) > 20 else ''}")

    opts = Options(flavor="woff2", layout_features=["*"])
    subsetter = Subsetter(opts)
    subsetter.populate(unicodes=sorted(covered))
    subsetter.subset(font)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    font.save(str(OUT))
    print(f"kept {len(covered)} codepoints → {OUT.relative_to(ROOT)} "
          f"({OUT.stat().st_size / 1024:.0f}KB)")


if __name__ == "__main__":
    main()
