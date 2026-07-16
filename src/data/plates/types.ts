// Config shape for one atlas plate (an antique map served as a Cloudinary
// tile pyramid, rendered by AtlasMap.tsx over Leaflet CRS.Simple). Mirrors
// the JourneyConfig pattern in src/data/journeys/types.ts — the Red Sea
// plate is just the first instance (rubri.ts), not something baked into the
// component.

export type AtlasPlace = {
  // EXACT glossary term when an entry exists — the popup's "View artworks"
  // lookup is an exact Map.get on glossary.json terms, so "Mount Parnassus"
  // works and "Parnassus" silently fails (this bug has shipped twice; see
  // scripts/check-pins.ts, which now guards it).
  term: string
  // Optional shorter display name; popup shows `label ?? term`.
  label?: string
  // Marks a poem-text place that intentionally has NO glossary entry (its
  // popup just has no artwork button — the Achaea precedent). Read only by
  // scripts/check-pins.ts to separate "intentional" from "typo".
  noGloss?: true
  // Master-image pixel coords (top-left origin), same convention as the
  // calibration dump.
  x: number
  y: number
}

export type PlateConfig = {
  slug: string // hash segment (#atlas/<slug>) — also used in tile paths for new plates
  title: string // shown in the atlas modal's plate <select>
  w: number // master scan pixel width
  h: number // master scan pixel height
  // dzsave pyramid depth: levels run 0..maxZoom, where maxZoom is native
  // resolution. Equals ceil(log2(max(w,h)/256)); record the value the
  // tiling script actually reports, don't derive it by hand.
  maxZoom: number
  // Cloudinary public_id prefix the tiles live under: "atlas" for the
  // legacy rubri pyramid (uploaded before plates were namespaced),
  // `atlas/<slug>` for every plate since.
  tileBase: string
  attribution: string // e.g. "Abraham Ortelius, Graecia Sophiani (1579) · Wikimedia Commons"
  places: AtlasPlace[]
}
