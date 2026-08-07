#!/usr/bin/env python3
"""Bake a per-place cover crop out of the Atlas plate that place deep-links to.

Before this, 61 of 84 place cards showed the SAME generic full-plate map JPEG
(`/art/map-greece.jpg` & co.) — and, since Phase A, clicking one opened the
Atlas zoomed on that place's pin, so the cover didn't even depict where the
click landed. This crops each place's `<slug>-map` art record out of
`plates/<findPin(term) slug>/master.jpg`, centred on the very pin coordinates
`DeepLinkFocus` centres on, so the card cover reads as a thumbnail of the view
the click leads to.

Which plate: whatever `findPin(term)` (no preferSlug) resolves to — NOT
whichever map the current art.json credit names. That's what makes cover and
destination agree, which is the whole point; it deliberately moves some places
off the non-Atlas maps (Delisle northern, Homer world, Lapie voyages) onto
their Ortelius plate. Ocean is deliberately unpinned, so it keeps `map-world`.

Usage:
    python3 scripts/bake_place_crops.py            # crop + write art.json
    python3 scripts/bake_place_crops.py --dry-run  # print the plan only
    python3 scripts/bake_place_crops.py --montage  # also build a contact sheet

Crops go to public/art/<key>.jpg (same `<slug>-map` key — the `*-map` suffix is
load-bearing: both the source-dedup and perceptual-dup sweeps skip it, since
maps are the one deliberate exception to image uniqueness). Upload with
scripts/upload_to_r2.py afterwards.

Needs `vips` (already used by scripts/make-plate.sh) — the masters run to
143MP / 220MB, which PIL would have to decode whole just to take a 2400px bite.
"""

import argparse
import json
import pathlib
import shutil
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
ART_JSON = ROOT / "src" / "data" / "art.json"
OUT_DIR = ROOT / "public" / "art"

# Native-resolution window, 4:3 to match the card's `aspect-[4/3]` figure.
# Sized ~1.5x wider than the Atlas's own deep-link view (maxZoom - 1.5) so the
# cover shows the pin's toponym plus enough surrounding coastline to orient —
# a card cover cropped as tight as the destination view reads as a blur of
# engraving. Downsampled to 1600x1200 per the house rule (max 1600px, q82).
WIN_W, WIN_H = 2400, 1800
OUT_W, OUT_H = 1600, 1200

# Wikimedia Commons page for each plate's source scan, for the art.json
# `source` field. Filenames are recorded in each src/data/plates/<slug>.ts
# header comment; rubri's is the same scan the Journey map's base was cropped
# from.
PLATE_SOURCE = {
    "graecia": "https://commons.wikimedia.org/wiki/File:Graecia_Sophiani.jpg",
    "aegyptus": (
        "https://commons.wikimedia.org/wiki/File:1584_Aegyptus_Antiqua_by_Abraham_Ortelius,"
        "_from_the_Digital_Commonwealth_-_commonwealth_cj82kx52v.jpg"
    ),
    "natoliae": (
        "https://commons.wikimedia.org/wiki/File:Natoliae_Quae_Olim_Asia_Minor_Nova_Descriptio.jpg"
    ),
    "palestinae": (
        "https://commons.wikimedia.org/wiki/File:Abraham_Ortelius,_Palestinae_sive_totius_"
        "Terrae_Promissionis_nova_descriptio_(FL200820524_2368827).jpg"
    ),
    "africae": (
        "https://commons.wikimedia.org/wiki/File:Theatrum_Orbis_Terrarum_-_Africae_Tabula_Nova.jpg"
    ),
    "rubri": (
        "https://commons.wikimedia.org/wiki/File:Abraham_Ortelius,_Erythraei_sive_Rubri_"
        "Maris_Periplus_(FL32963697_2720706).jpg"
    ),
}


def manifest():
    """term -> {key, slug, x, y, plate title/attribution} via the real registry.

    Shelling out to tsx rather than re-parsing the plate .ts files keeps
    `findPin`'s priority/case-fallback logic in exactly one place.
    """
    script = """
import { PLATES, findPin } from "./src/data/plates/index.ts"
import glossary from "./src/data/glossary.json" with { type: "json" }
const out = []
for (const e of glossary) {
  if (e.tag !== "place") continue
  const key = e.art.find((k) => k.endsWith("-map"))
  if (!key) continue
  const hit = findPin(e.term)
  if (!hit) continue                       // Ocean: deliberately unpinned
  const p = PLATES[hit.slug]
  out.push({ term: e.term, key, slug: hit.slug, x: hit.place.x, y: hit.place.y,
             title: p.title, attribution: p.attribution, w: p.w, h: p.h })
}
console.log(JSON.stringify(out))
"""
    res = subprocess.run(
        ["npx", "tsx", "-e", script],
        cwd=ROOT, capture_output=True, text=True, check=True,
    )
    return json.loads(res.stdout.strip().splitlines()[-1])


def crop(master: pathlib.Path, x: int, y: int, pw: int, ph: int, dest: pathlib.Path):
    """Crop a WIN_W x WIN_H window centred on (x, y), clamped to the plate."""
    w, h = min(WIN_W, pw), min(WIN_H, ph)
    left = max(0, min(x - w // 2, pw - w))
    top = max(0, min(y - h // 2, ph - h))
    with tempfile.TemporaryDirectory() as tmp:
        raw = pathlib.Path(tmp) / "raw.v"
        subprocess.run(
            ["vips", "crop", str(master), str(raw), str(left), str(top), str(w), str(h)],
            check=True, capture_output=True,
        )
        # House recompression: <=1600px, q82, progressive, 4:2:0, no metadata.
        subprocess.run(
            ["vips", "thumbnail", str(raw),
             f"{dest}[Q=82,interlace,strip,subsample_mode=on,optimize_coding]",
             str(OUT_W), "--height", str(OUT_H)],
            check=True, capture_output=True,
        )
    return left, top, w, h


# The credit that replaces the old generic-map one. Year comes out of the
# plate's own attribution string ("... (1579) · Wikimedia Commons"), and the
# title is PLATES[slug].title verbatim so the card, its lightbox caption and
# the Atlas header all name the same plate.
def credit(row):
    attr = row["attribution"]
    year = attr.split("(")[-1].split(")")[0] if "(" in attr else ""
    return {
        "artist": "Abraham Ortelius",
        "title": row["title"],
        "year": year,
        "source": PLATE_SOURCE[row["slug"]],
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--montage", action="store_true", help="build a contact sheet to eyeball")
    args = ap.parse_args()

    if not shutil.which("vips"):
        sys.exit("vips not found (brew install vips)")

    rows = manifest()
    print(f"{len(rows)} place crops to bake")

    art = json.loads(ART_JSON.read_text())
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for row in rows:
        master = ROOT / "plates" / row["slug"] / "master.jpg"
        dest = OUT_DIR / f"{row['key']}.jpg"
        if args.dry_run:
            print(f"  {row['term']:<28} {row['slug']:<11} ({row['x']},{row['y']})"
                  f"  {art[row['key']]['file']} -> /art/{row['key']}.jpg")
            continue
        if not master.exists():
            sys.exit(f"missing master: {master}")
        crop(master, row["x"], row["y"], row["w"], row["h"], dest)
        rec = art[row["key"]]
        rec["file"] = f"/art/{row['key']}.jpg"
        rec.update(credit(row))
        rec.pop("cld", None)  # dead Cloudinary id; the crop is a new asset anyway
        print(f"  ✓ {row['term']:<28} {row['slug']}")

    if args.dry_run:
        return

    ART_JSON.write_text(json.dumps(art, indent=2, ensure_ascii=False) + "\n")
    print(f"wrote {ART_JSON.relative_to(ROOT)}")

    if args.montage:
        sheet = ROOT / "place-crops-montage.jpg"
        subprocess.run(
            ["montage", *[str(OUT_DIR / f"{r['key']}.jpg") for r in rows],
             "-label", "%f", "-tile", "6x", "-geometry", "260x195+4+4",
             "-background", "black", "-fill", "white", str(sheet)],
            check=True,
        )
        print(f"montage: {sheet}")


if __name__ == "__main__":
    main()
