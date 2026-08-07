import type { AtlasPlace, PlateConfig } from "./types"

// Abraham Ortelius, "Erythraei Sive Rubri Maris Periplus" (1597) — the FULL
// Red Sea plate (Egypt, Arabia, Persia, India, East Africa), of which the
// "Vlyssis Errores" Aegean inset JourneyMap uses is only a corner. Source
// scan: Wikimedia Commons, 13238x10802px; local master at
// plates/rubri/master.jpg (git-ignored; MD5-identical copy also at
// ~/Desktop/ortelius-FULL-PLATE.jpg). Tiles were regenerated from that
// master during the Cloudinary->R2 migration (the original tile pyramid was
// never persisted locally, only the master), and now live at the same
// namespaced "atlas/rubri/{z}/{row}/{col}.jpg" R2 prefix as every other
// plate — R2 is a fresh key space, so the old bare "atlas/..." Cloudinary
// exception (tiles predating plate namespacing) wasn't replicated.
//
// Plate-coverage audit (close inspection of the full-res scan, cross-
// referenced against the glossary):
// - Egypt: clearly labelled "AEGYPTVS" with Alexandria/Coptos/Diospolis.
// - Pharos: pinned at the coast by "Alexandria" (the island where Menelaus
//   wrestles Proteus in Book 4 — its own glossary entry, distinct from Egypt).
// - Ethiopia: only in the small "Annonis Periplus" inset (Hanno's voyage,
//   top-left), labelled "AETHIOPES AXENI" — not the main plate body.
// - Phoenicia / Sidon: NOT on this plate — the frame's top edge cuts off
//   right at "Hierusalem". Their pins here are placeholder/symbolic; their
//   real home is the Palestinae plate (see palestinae.ts).
// - Arabia / Persia / India: genuinely drawn on the main plate body (the
//   Erythraean periplus is the plate's whole subject) — CALIBRATED
//   2026-08-07 onto their printed labels (offline PIL grid-crops of the
//   master at native resolution + marked-ring verification, the same method
//   used for Graecia): Arabia on "ARABIA EVDAEMON, Sive FELIX", Persia on
//   "PERSIA." inland of the Persian Gulf. India is the one compromise —
//   this plate carries NO printed "India" (Ortelius labels the subcontinent
//   with Ptolemaic regional names: SYNRASTRENA, ARIACA, DACHINABADES,
//   LIMYRICA, MASALIA…), so its pin sits mid-peninsula on "Mambari regnum",
//   with the "Indus fluvius" annotation off to the northwest (~7200,3450).
// - PRUNED 2026-08-07: the 69 Greek/Aegean pins that used to crowd the
//   Vlyssis Errores inset (x≈3200–7800, y≈7500–10200) are gone — every one
//   of them is now calibrated on the Graecia Sophiani plate at real
//   cartographic scale. rubri keeps only what Graecia's frame does NOT
//   cover: the mythical/voyage places the inset alone depicts (Aeaea,
//   Ogygia, Scheria, Thrinacia, Aeolia, Telepylus, Artaky, the Lands of the
//   Cyclopes/Lotus-Eaters, Cimmerians, Hyperia, Temese, Ortygia and the
//   Underworld cluster), plus Cyprus and the Levantine/African/Asian pins.
//   Deleting from here is deliberate and one-way: if a term ever needs to
//   come back, re-derive it against the graecia term set, don't restore
//   these old inset coordinates.
// Latin forms harvested 2026-08-07 by reading the master at native
// resolution — see CLAUDE.md TODO 1b. Most of this plate's Vlyssis-inset
// pins were positioned by geography rather than a tight label match (unlike
// graecia's calibration pass), so ABSENT is common here — it means no
// engraved caption sits within a plausible distance of the pin, not that
// none was checked. Phoenicia/Sidon are this plate's placeholder/symbolic
// duplicates (real home: palestinae.ts); India rides "Mambari regnum",
// which names the region, not India itself. All three deliberately absent.
// FIXED 2026-08-08 (Plan.md Phase 0e): 4 pins (Lotus-Eaters, Temese, Ortygia,
// Cyclopes) had drifted south into the blank page margin below the inset's
// printed frame — found by a visual sweep, confirmed by cropping the master
// at native res (blank parchment, no engraving under any of the 4). Fixed by
// deriving the crop-to-master transform (FFT cross-correlation of
// public/art/map-wanderings.jpg against plates/rubri/master.jpg, offset
// confirmed visually via a stacked side-by-side comparison) to relocate the
// search into the inset's true bounds, then reading each label directly off
// the master at native resolution. Lotus-Eaters -> "LOTOP.HAGI.", Cyclopes ->
// "CYCLOPES" (both label the same Sicily-standing landmass as the existing
// Thrinacia pin, from adjacent but distinct captions), Temese -> "Temessa"
// (the toe-of-Italy town glyph, north of the strait). Ortygia has no engraved
// caption anywhere on the inset (checked exhaustively) — parked on an
// unlabeled islet in the Scylla/Charybdis strait, between Temessa and
// Thrinacia, matching Wilson's glossary description ("a small Sicilian
// island near the mainland"). All 4 verified with marked-ring crops at
// native resolution before committing, same method as the Graecia pins.
// FIXED 2026-08-08: Aeaea was another of the "loosely placed by geography"
// pins, sitting in open sea near Ogygia/Scheria with nothing engraved under
// it — caught because the pronunciation-button work surfaced its missing
// Latin bracket. Ortelius actually captions Aeaea near "Roma", following the
// Roman-tradition identification of Circe's island with Cape Circeo on the
// Italian coast (this inset's whole western half follows that tradition —
// Scylla/Charybdis at the Strait of Messina, Aeolia at the Lipari islands —
// not just the Aegean). Found via a downscaled full-inset overview scan
// (rather than guessing a transform from the Journey map's own base image,
// which CLAUDE.md already documents as error-prone) and confirmed with a
// marked-ring crop at native resolution: "Aeæa insula, quæ Circes
// domicilium".
const places: AtlasPlace[] = [
  { term: "Egypt", latin: "ÆGYPTVS", x: 1895.0465881021837, y: 3472.711389904327 },
  { term: "Libya", x: 1413.143047187622, y: 3556.0782783688514 },
  { term: "Ethiopia", x: 1650, y: 5650 },
  { term: "Pharos", x: 2391.0785275036137, y: 3261.3480639249724 },
  { term: "Aeaea", latin: "Aeæa insula, quæ Circes domicilium", x: 4480, y: 7390 },
  { term: "Scheria", latin: "Phæacia, quę Scheria", x: 6448, y: 8082 },
  { term: "Ogygia", latin: "Ogygia Calypsonis habitaculum", x: 5818, y: 8011 },
  { term: "Cyprus", x: 7699, y: 9105 },
  { term: "Hyperia", x: 5413, y: 8664 },
  { term: "Cimmerians", x: 7467, y: 7934 },
  { term: "Temese", latin: "Temessa", x: 5410, y: 7785 },
  { term: "Telepylus", x: 4800, y: 8900 },
  { term: "Artaky", x: 7390, y: 7735 },
  { term: "Aeolia", latin: "Aeoliæ, et Planctæ", x: 3800, y: 8400 },
  { term: "Land of the Lotus-Eaters", label: "Lotus-Eaters", latin: "LOTOP.HAGI.", x: 4595, y: 8635 },
  { term: "Land of the Cyclopes", label: "Cyclopes", latin: "CYCLOPES", x: 4760, y: 8310 },
  { term: "Thrinacia", latin: "THRINACIA, Sive Solis insula", x: 4555, y: 8430 },
  { term: "Styx", x: 2500, y: 7200 },
  { term: "Acheron", x: 2400, y: 7300 },
  { term: "Cocytus", x: 2600, y: 7400 },
  { term: "Pyriphlegethon", x: 2700, y: 7500 },
  { term: "Erebus", x: 2300, y: 7100 },
  { term: "The Underworld", label: "Underworld", x: 2500, y: 7250 },
  { term: "Phoenicia", x: 3400, y: 5800 },
  { term: "Sidon", x: 3500, y: 5900 },
  { term: "Mount Solyma", label: "Solyma", x: 3700, y: 6100 },
  { term: "Ortygia", x: 5450, y: 8150 },
  { term: "Africa", noGloss: true, x: 1500, y: 5000 },
  { term: "Arabia", noGloss: true, latin: "ARABIA EVDAEMON, Sive FELIX", x: 3280, y: 3960 },
  { term: "India", noGloss: true, x: 7760, y: 4530 },
  { term: "Persia", noGloss: true, latin: "PERSIA", x: 5250, y: 3175 },
]

export const rubriPlate: PlateConfig = {
  slug: "rubri",
  title: "The Red Sea Plate",
  w: 13238,
  h: 10802,
  maxZoom: 6,
  tileBase: "atlas/rubri",
  attribution: "Abraham Ortelius, Erythraei sive Rubri Maris Periplus (1597) · Wikimedia Commons",
  places,
}
