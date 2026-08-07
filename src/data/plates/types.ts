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
  // The toponym as Ortelius actually engraved it at this pin ("CRETA",
  // "Cnodos", "Alpheus flu."), harvested by reading each plate master at
  // native resolution — never guessed from the English name. ABSENT on
  // interpretive/positional pins where the plate prints no name for the
  // place (rubri's India, the Underworld cluster…): that absence is
  // meaningful, and scripts/check-pins.ts enforces it against its NO_LATIN
  // allowlist. Surfaces show it via latinFor() (index.ts), which hides the
  // bracket when the engraved form is just the English name over again.
  latin?: string
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
  // R2 object-key prefix the tiles live under, always `atlas/<slug>`
  // (uniform across every plate, including rubri — R2 is a fresh key space
  // so the old Cloudinary-era bare "atlas" prefix for rubri wasn't carried
  // over).
  tileBase: string
  attribution: string // e.g. "Abraham Ortelius, Graecia Sophiani (1579) · Wikimedia Commons"
  places: AtlasPlace[]
}
