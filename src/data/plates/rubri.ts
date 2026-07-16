import type { AtlasPlace, PlateConfig } from "./types"

// Abraham Ortelius, "Erythraei Sive Rubri Maris Periplus" (1597) — the FULL
// Red Sea plate (Egypt, Arabia, Persia, India, East Africa), of which the
// "Vlyssis Errores" Aegean inset JourneyMap uses is only a corner. Source
// scan: Wikimedia Commons, 13238x10802px; local master at
// plates/rubri/master.jpg (git-ignored; MD5-identical copy also at
// ~/Desktop/ortelius-FULL-PLATE.jpg). Tiles predate plate namespacing so
// they live at the bare "atlas/{z}/{row}/{col}" Cloudinary prefix.
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
//   Erythraean periplus is the plate's whole subject) — current pins are
//   rough placeholders awaiting #atlas/rubri-eyeball calibration.
// - The Greek/Aegean places sit inside the Vlyssis Errores inset region
//   (x≈3200–7800, y≈7500–10200). Once the Graecia Sophiani plate is
//   calibrated they MOVE there (decluttering the dense inset cluster);
//   rubri keeps the mythical/voyage places the inset alone depicts —
//   Aeaea, Ogygia, Scheria, Thrinacia, Aeolia, Telepylus, Artaky, the
//   Lands of the Cyclopes/Lotus-Eaters, Cimmerians, Hyperia, Gyrae,
//   Temese (S. Italy is drawn on the inset), and the Underworld cluster.
const places: AtlasPlace[] = [
  { term: "Egypt", x: 1895.0465881021837, y: 3472.711389904327 },
  { term: "Libya", x: 1413.143047187622, y: 3556.0782783688514 },
  { term: "Ethiopia", x: 1650, y: 5650 },
  { term: "Pharos", x: 2391.0785275036137, y: 3261.3480639249724 },
  { term: "Achaea", noGloss: true, x: 4200, y: 9400 },
  { term: "Ithaca", x: 6787, y: 8459 },
  { term: "Sparta", x: 4800, y: 9700 },
  { term: "Athens", x: 5400, y: 8900 },
  { term: "Pylos", x: 4100, y: 9800 },
  { term: "Argos (the city)", label: "Argos", x: 5000, y: 9200 },
  { term: "Troy", x: 8640, y: 7258 },
  { term: "Mycenae", x: 5100, y: 9100 },
  { term: "Aeaea", x: 5660, y: 8382 },
  { term: "Scheria", x: 6448, y: 8082 },
  { term: "Ogygia", x: 5818, y: 8011 },
  { term: "Chios", x: 8560, y: 7942 },
  { term: "Lemnos", x: 7630, y: 8796 },
  { term: "Lesbos", x: 6200, y: 8400 },
  { term: "Delos", x: 6000, y: 8800 },
  { term: "Cyprus", x: 7699, y: 9105 },
  { term: "Gortyn", x: 6800, y: 9600 },
  { term: "Cythera", x: 7589, y: 8924 },
  { term: "Thrace", x: 6200, y: 8000 },
  { term: "Thesprotia", x: 4422, y: 8843 },
  { term: "Elis", x: 4300, y: 9500 },
  { term: "Messenia", x: 4200, y: 9800 },
  { term: "Marathon", x: 5600, y: 8700 },
  { term: "Sounion", x: 5700, y: 9000 },
  { term: "Euboea", x: 6000, y: 8700 },
  { term: "Chalcis", x: 6100, y: 8750 },
  { term: "Orchomenus", x: 5900, y: 8600 },
  { term: "Panopeus", x: 5800, y: 8650 },
  { term: "Mount Parnassus", label: "Parnassus", x: 5000, y: 8700 },
  { term: "Pelion", x: 7200, y: 7900 },
  { term: "Ossa", x: 7055, y: 7975 },
  { term: "Erymanthus", x: 4900, y: 9000 },
  { term: "Mount Neion", label: "Neion", x: 6400, y: 8850 },
  { term: "Mount Neriton", label: "Neriton", x: 6300, y: 8800 },
  { term: "Taygetus", x: 5200, y: 8950 },
  { term: "Asteris", x: 6500, y: 9000 },
  { term: "Taphos", x: 6600, y: 9100 },
  { term: "Iolcus", x: 6700, y: 7900 },
  { term: "Ismarus", x: 7200, y: 7850 },
  { term: "Aegae", x: 7000, y: 7850 },
  { term: "Phaestus", x: 6700, y: 9500 },
  { term: "Amnisus", x: 6800, y: 9400 },
  { term: "Phaea", x: 6700, y: 9200 },
  { term: "Pherae", x: 6200, y: 8700 },
  { term: "Phthia", x: 6200, y: 8600 },
  { term: "Phylace", x: 6800, y: 9300 },
  { term: "Pieria", x: 7300, y: 7800 },
  { term: "Hyperesia", x: 5200, y: 8650 },
  { term: "Hyperia", x: 5413, y: 8664 },
  { term: "Gyrae", x: 5415, y: 7951 },
  { term: "Geraestus", x: 5317, y: 8787 },
  { term: "Cimmerians", x: 7467, y: 7934 },
  { term: "Psara", x: 6336, y: 9075 },
  { term: "Same", x: 4500, y: 9700 },
  { term: "Zacynthus", x: 4300, y: 9800 },
  { term: "Tenedos", x: 6442, y: 8252 },
  { term: "Scyros", x: 6300, y: 8400 },
  { term: "Temese", x: 4400, y: 9600 },
  { term: "Telepylus", x: 4800, y: 8900 },
  { term: "Artaky", x: 7390, y: 7735 },
  { term: "Arethusa", x: 5961, y: 9018 },
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
  { term: "River Jardan", label: "Jardan", x: 3600, y: 6000 },
  { term: "Mount Solyma", label: "Solyma", x: 3700, y: 6100 },
  { term: "Olympus", x: 6059, y: 8283 },
  { term: "Ortygia", x: 6900, y: 9700 },
  { term: "Ephyra", x: 4600, y: 9300 },
  { term: "Arcadia", noGloss: true, x: 5000, y: 9300 },
  { term: "Attica", noGloss: true, x: 5600, y: 8900 },
  { term: "Boeotia", noGloss: true, x: 5700, y: 8600 },
  { term: "Crete", noGloss: true, x: 6800, y: 9550 },
  { term: "Crouni", noGloss: true, x: 5200, y: 8900 },
  { term: "Enipeus", noGloss: true, x: 7100, y: 8000 },
  { term: "Knossos", noGloss: true, x: 6850, y: 9500 },
  { term: "Laconia", noGloss: true, x: 5100, y: 9400 },
  { term: "Malea", x: 5300, y: 9200 },
  { term: "Mimas", x: 8200, y: 8100 },
  { term: "Peloponnese", noGloss: true, x: 5000, y: 9500 },
  { term: "Thebes", noGloss: true, x: 5800, y: 8550 },
  { term: "Thessaly", noGloss: true, x: 6800, y: 8200 },
  { term: "Alpheus", noGloss: true, x: 4600, y: 9600 },
  { term: "Africa", noGloss: true, x: 1500, y: 5000 },
  { term: "Arabia", noGloss: true, x: 3000, y: 5500 },
  { term: "India", noGloss: true, x: 4500, y: 4000 },
  { term: "Persia", noGloss: true, x: 3800, y: 4500 },
]

export const rubriPlate: PlateConfig = {
  slug: "rubri",
  title: "The Red Sea Plate",
  w: 13238,
  h: 10802,
  maxZoom: 6,
  tileBase: "atlas",
  attribution: "Abraham Ortelius, Erythraei sive Rubri Maris Periplus (1597) · Wikimedia Commons",
  places,
}
