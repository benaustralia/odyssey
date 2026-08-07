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
// Calibrated 2026-08-07 (offline PIL/vips grid-crop + marked-ring
// verification, same method as Graecia/rubri/aegyptus in Plan.md Phase 0 —
// these 3 were left on their seed grid, parked in blank ocean in the
// "OCEANVS ATLANTICVS" corner, until caught mid-Phase-C when their bake
// crops rendered as the plate's decorative title cartouche instead of any
// real geography):
// - Africa (noGloss) → (3980, 6480), on the "AFRI" of the plate's own
//   "AFRICAE TABULA NOVA" title cartouche.
// - Libya → (5650, 2450), on "Lybiae Deserta" (the Sahara/Libyan Desert
//   region label north of Nigritarum Regio) — matches the glossary's "land
//   on the northern coast of Africa."
// - Ethiopia → (7700, 4350), on "totius Africae" in the plate's Prester
//   John legend ("Hic longe lateque imperitat magnus princeps Presbiter
//   Ioannes dictus totius Africae potentissimus Rex"). The plate prints no
//   literal "AETHIOPIA" anywhere (checked the Nubia/Horn-of-Africa interior,
//   the Mozambique/Zanzibar coast, and the "Oceanus Aethiopicus" ocean label
//   — the last sits over blank ocean off Brazil, wrong hemisphere for an
//   African place). Prester John's realm is the closest thing to a printed
//   Ethiopia on this specific plate — Renaissance cartographers themselves
//   identified it with Abyssinia/Ethiopia — and the glossary's own "not the
//   modern country" framing makes a legendary anchor an apt compromise, the
//   same kind of call as rubri's India pin landing on "Mambari regnum."
// Latin forms per the calibration notes above: Africa rides the title
// cartouche's own words; Ethiopia deliberately has NONE — "totius Africae"
// (the Prester John legend its pin sits on) does not NAME Ethiopia, it
// merely anchors it, so a bracket would mislead (interpretive pin, on the
// check-pins NO_LATIN allowlist).
const places: AtlasPlace[] = [
  { term: "Africa", noGloss: true, latin: "AFRICAE TABULA NOVA", x: 3980, y: 6480 },
  { term: "Ethiopia", x: 7700, y: 4350 },
  { term: "Libya", latin: "Lybiae Deserta", x: 5650, y: 2450 },
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
