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
const places: AtlasPlace[] = [
  { term: "Egypt", x: 1895.0465881021837, y: 3472.711389904327 },
  { term: "Libya", x: 1413.143047187622, y: 3556.0782783688514 },
  { term: "Ethiopia", x: 1650, y: 5650 },
  { term: "Pharos", x: 2391.0785275036137, y: 3261.3480639249724 },
  { term: "Aeaea", x: 5660, y: 8382 },
  { term: "Scheria", x: 6448, y: 8082 },
  { term: "Ogygia", x: 5818, y: 8011 },
  { term: "Cyprus", x: 7699, y: 9105 },
  { term: "Hyperia", x: 5413, y: 8664 },
  { term: "Cimmerians", x: 7467, y: 7934 },
  { term: "Temese", x: 4400, y: 9600 },
  { term: "Telepylus", x: 4800, y: 8900 },
  { term: "Artaky", x: 7390, y: 7735 },
  { term: "Aeolia", x: 3800, y: 8400 },
  { term: "Land of the Lotus-Eaters", label: "Lotus-Eaters", x: 2000, y: 9500 },
  { term: "Land of the Cyclopes", label: "Cyclopes", x: 7500, y: 10000 },
  { term: "Thrinacia", x: 4555, y: 8430 },
  { term: "Styx", x: 2500, y: 7200 },
  { term: "Acheron", x: 2400, y: 7300 },
  { term: "Cocytus", x: 2600, y: 7400 },
  { term: "Pyriphlegethon", x: 2700, y: 7500 },
  { term: "Erebus", x: 2300, y: 7100 },
  { term: "The Underworld", label: "Underworld", x: 2500, y: 7250 },
  { term: "Phoenicia", x: 3400, y: 5800 },
  { term: "Sidon", x: 3500, y: 5900 },
  { term: "Mount Solyma", label: "Solyma", x: 3700, y: 6100 },
  { term: "Ortygia", x: 6900, y: 9700 },
  { term: "Africa", noGloss: true, x: 1500, y: 5000 },
  { term: "Arabia", noGloss: true, x: 3280, y: 3960 },
  { term: "India", noGloss: true, x: 7760, y: 4530 },
  { term: "Persia", noGloss: true, x: 5250, y: 3175 },
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
