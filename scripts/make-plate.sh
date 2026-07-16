#!/usr/bin/env zsh
# Fetch an Ortelius plate scan from Wikimedia Commons and slice it into the
# Google-layout tile pyramid AtlasMap.tsx serves from Cloudinary.
#
#   ./scripts/make-plate.sh graecia "Graecia Sophiani.jpg"
#
# Writes plates/<slug>/master.jpg (kept as the local master, git-ignored) and
# plates/<slug>/tiles/{z}/{row}/{col}.jpg, then prints the values the plate's
# config in src/data/plates/<slug>.ts needs (w/h/maxZoom/tile count).
# Upload the tiles with scripts/upload_tiles.py afterwards.
#
# Note dzsave's "google" layout writes {z}/{row}/{col}.jpg — the transpose of
# Leaflet's {z}/{x}/{y}; AtlasMap's URL template compensates. Don't "fix" it.
set -euo pipefail

slug=$1
title=$2
dir="plates/$slug"
mkdir -p "$dir"

if [ ! -f "$dir/master.jpg" ]; then
  # Special:FilePath 302-redirects to the original upload; UA header per
  # Wikimedia's bot policy for large downloads.
  url="https://commons.wikimedia.org/wiki/Special:FilePath/${title// /%20}"
  echo "fetching $title ..."
  curl -L --fail --retry 3 \
    -H "User-Agent: OdysseyGlossary/1.0 (bahinton@gmail.com)" \
    -o "$dir/master.jpg" "$url"
fi

w=$(vipsheader -f width "$dir/master.jpg")
h=$(vipsheader -f height "$dir/master.jpg")

rm -rf "$dir/tiles"
vips dzsave "$dir/master.jpg" "$dir/tiles" \
  --layout google --suffix '.jpg[Q=82]' --tile-size 256 --overlap 0

maxz=$(ls "$dir/tiles" | grep -E '^[0-9]+$' | sort -n | tail -1)
count=$(find "$dir/tiles" -name '*.jpg' | wc -l | tr -d ' ')
size=$(du -sh "$dir/tiles" | cut -f1)

echo ""
echo "plate config values for src/data/plates/$slug.ts:"
echo "  slug: \"$slug\"  w: $w  h: $h  maxZoom: $maxz  tileBase: \"atlas/$slug\""
echo "  ($count tiles, $size)"
