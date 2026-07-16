#!/usr/bin/env python3
"""Upload one plate's tile pyramid to Cloudinary at deterministic public_ids.

    export CLOUDINARY_URL=$(grep ^CLOUDINARY_URL= ~/Documents/wallpapers-1850s/.env | cut -d= -f2-)
    ~/Documents/wallpapers-1850s/.venv/bin/python scripts/upload_tiles.py <slug> [--verify]

Each plates/<slug>/tiles/{z}/{row}/{col}.jpg lands at public_id
"atlas/<slug>/{z}/{row}/{col}" — an explicit public_id with overwrite=True
pins the delivery path even though this account's dynamic-folder mode
randomizes plain uploads, so tile URLs need no lookup manifest (AtlasMap
builds them straight from the plate config's tileBase). Re-running is
idempotent (overwrite). --verify skips uploading and instead spot-checks
delivery URLs (all four corners + centre of every zoom level) for HTTP 200.

The legacy rubri pyramid predates plate namespacing and lives at the bare
"atlas/{z}/{row}/{col}" prefix; everything since is namespaced by slug.
"""
import os
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

CLD = "https://res.cloudinary.com/dhvvz91bh/image/upload"


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if len(args) != 1:
        sys.exit("usage: upload_tiles.py <slug> [--verify]")
    slug = args[0]
    tiles = Path(__file__).resolve().parent.parent / "plates" / slug / "tiles"
    if not tiles.is_dir():
        sys.exit(f"{tiles} not found — run scripts/make-plate.sh first")
    files = sorted(tiles.rglob("*.jpg"))  # excludes dzsave's blank.png

    if "--verify" in sys.argv:
        verify(slug, tiles)
        return

    if not os.environ.get("CLOUDINARY_URL"):
        sys.exit("CLOUDINARY_URL not set — see the docstring")
    import cloudinary.uploader  # deferred so --verify needs no SDK/env

    def up(f: Path) -> None:
        rel = f.relative_to(tiles).with_suffix("")  # z/row/col
        public_id = f"atlas/{slug}/{rel}"
        for attempt in range(4):
            try:
                cloudinary.uploader.upload(
                    str(f), public_id=public_id, overwrite=True,
                    unique_filename=False, resource_type="image",
                )
                return
            except Exception:
                if attempt == 3:
                    raise
                time.sleep(2 ** attempt)  # backoff on transient/rate-limit errors

    done = 0
    with ThreadPoolExecutor(max_workers=8) as ex:
        futures = {ex.submit(up, f): f for f in files}
        for fut in as_completed(futures):
            fut.result()
            done += 1
            if done % 250 == 0 or done == len(files):
                print(f"  {done}/{len(files)}", flush=True)
    print(f"uploaded {len(files)} tiles under atlas/{slug}/")


def verify(slug: str, tiles: Path) -> None:
    """HEAD the corner + centre tile of every level; any non-200 is a fail."""
    bad = []
    for zdir in sorted(tiles.iterdir()):
        if not zdir.name.isdigit():
            continue
        rows = sorted(int(d.name) for d in zdir.iterdir() if d.name.isdigit())
        cols = sorted(int(f.stem) for f in (zdir / str(rows[0])).glob("*.jpg"))
        picks = {(rows[0], cols[0]), (rows[0], cols[-1]), (rows[-1], cols[0]),
                 (rows[-1], cols[-1]), (rows[len(rows) // 2], cols[len(cols) // 2])}
        for r, c in picks:
            url = f"{CLD}/atlas/{slug}/{zdir.name}/{r}/{c}"
            req = urllib.request.Request(url, method="HEAD")
            try:
                with urllib.request.urlopen(req) as resp:
                    if resp.status != 200:
                        bad.append(f"{resp.status} {url}")
            except Exception as e:
                bad.append(f"{e} {url}")
    if bad:
        sys.exit("verify FAILED:\n  " + "\n  ".join(bad))
    print(f"verify OK: sampled tiles of every level respond 200 for atlas/{slug}/")


if __name__ == "__main__":
    main()
