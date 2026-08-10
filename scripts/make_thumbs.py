#!/usr/bin/env python3
"""
Generate card-grid cover thumbnails: 800px-wide WebP versions of every
glossary entry's art[0] (the only image ever used as a card cover — see
coverThumbUrl in src/lib/entries.ts). Source masters are ~250-370KB JPEGs
sized for the full-res lightbox/entry-page hero; a ~380px-wide card grid
cell doesn't need that much data (Lighthouse mobile flagged the masters as
3-4x oversized here). Output goes to public/art-thumb/ (git-ignored, same
"kept locally for re-sync" pattern as public/art/) for scripts/upload_to_r2.py
to pick up.

Re-run this after any harvest that changes which image is art[0] for an
entry, or after re-cropping/replacing a cover image in public/art/.
"""

import json
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
THUMB_WIDTH = 800
QUALITY = 78


def cover_files(repo_root):
    glossary = json.loads((repo_root / "src" / "data" / "glossary.json").read_text())
    art = json.loads((repo_root / "src" / "data" / "art.json").read_text())
    keys = {e["art"][0] for e in glossary if e.get("art")}
    files = set()
    for k in keys:
        a = art.get(k)
        if not a:
            print(f"  WARNING: no art.json entry for cover key {k!r}", file=sys.stderr)
            continue
        files.add(a["file"].removeprefix("/art/"))
    return sorted(files)


def main():
    art_dir = REPO_ROOT / "public" / "art"
    thumb_dir = REPO_ROOT / "public" / "art-thumb"
    thumb_dir.mkdir(exist_ok=True)

    files = cover_files(REPO_ROOT)
    print(f"Generating {len(files)} cover thumbnails ({THUMB_WIDTH}px, q{QUALITY}, WebP)...")

    failed = []
    for name in files:
        src = art_dir / name
        if not src.exists():
            failed.append((name, "source master not found in public/art/"))
            continue
        dst = thumb_dir / (Path(name).stem + ".webp")
        result = subprocess.run(
            ["magick", str(src), "-resize", f"{THUMB_WIDTH}x{THUMB_WIDTH}>",
             "-strip", "-quality", str(QUALITY), str(dst)],
            capture_output=True, text=True,
        )
        if result.returncode != 0:
            failed.append((name, result.stderr.strip()))

    print(f"Done: {len(files) - len(failed)} succeeded, {len(failed)} failed")
    for name, err in failed:
        print(f"  FAILED {name}: {err}")

    # Prune orphaned thumbnails (source no longer a cover, e.g. art[0] changed).
    keep = {Path(n).stem + ".webp" for n in files}
    orphans = [p for p in thumb_dir.glob("*.webp") if p.name not in keep]
    for p in orphans:
        p.unlink()
    if orphans:
        print(f"Pruned {len(orphans)} orphaned thumbnail(s)")

    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
