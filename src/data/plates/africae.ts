import type { AtlasPlace, PlateConfig } from "./types"

// Abraham Ortelius, "Africae Tabula Nova" (1570) — the full continent at
// real cartographic scale, where the Red Sea plate only shows Egypt/Libya
// on its margin and Ethiopia in a small corner inset. Source scan:
// Wikimedia Commons "Theatrum Orbis Terrarum - Africae Tabula Nova.jpg",
// 12504x9430; local master at plates/africae/master.jpg (git-ignored).
//
// Frame audit: no watermark, frame intact, full continent visible edge to
// edge. "Africa" itself is not a glossary term (Odysseus's world doesn't
// name the continent) so it's pinned noGloss, same convention as Achaea.
// Ethiopia's glossary def calls it "a mythical land at the edge of the
// world, lying between sunset and dawn" rather than a real place — when
// calibrating, treat its position as approximate/symbolic (e.g. near
// Ortelius's own equatorial-Africa labels), not a precise claim about
// where Homer meant it.
//
// SEED GRID — the 3 places below are parked in open water in the
// "OCEANVS ATLANTICVS" corner, NOT at their real location yet. Calibrate
// at #atlas/africae-eyeball, then paste the JSON back over this array.
// Libya and Ethiopia also have a home on rubri (its margin/inset).
const places: AtlasPlace[] = [
  { term: "Africa", noGloss: true, x: 1340, y: 900 },
  { term: "Ethiopia", x: 1790, y: 900 },
  { term: "Libya", x: 1340, y: 1250 },
]

export const africaePlate: PlateConfig = {
  slug: "africae",
  title: "Africae Tabula Nova",
  w: 12504,
  h: 9430,
  maxZoom: 6,
  tileBase: "atlas/africae",
  attribution: "Abraham Ortelius, Africae Tabula Nova (1570) · Wikimedia Commons",
  places,
}
