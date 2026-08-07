import type { AtlasPlace, PlateConfig } from "./types"

// Abraham Ortelius, "Graecia Sophiani" (Theatrum Orbis Terrarum; after
// Nikolaos Sophianos) — the primary Greek map: all mainland Greece, the
// Peloponnese, Crete, the Aegean islands and western Anatolia at real
// cartographic fidelity, where the Red Sea plate only has the cramped
// Vlyssis Errores inset. Source scan: Wikimedia Commons "Graecia
// Sophiani.jpg", 12325x8913; local master at plates/graecia/master.jpg
// (git-ignored). NOT on this plate: Cyprus (frame ends at Rhodes /
// Pamphylia) — it stays on rubri and palestinae.
//
// CALIBRATED 2026-08-06: all 69 pins placed on Ortelius's own labels/symbols
// by reading the master scan at native resolution. Flag review RESOLVED
// 2026-08-07: Argos<->Mycenae exchanged onto their own engraved labels
// ("Argos." names the NE castle, the diagonal "Mycene." the SW one); Phylace
// moved off the Pierian homonym label to the Thessalian position per
// Wilson's def; Chalcis/Crouni/Enipeus/Gyrae confirmed.
// Adjust any pin at #atlas/graecia/edit (drag -> "Copy all" -> paste back
// over this array).
// Latin forms harvested 2026-08-07 by reading the master at native resolution
// (per-pin marked-ring crops, same method as the pin calibration itself) —
// see CLAUDE.md TODO 1b. ABSENT means the plate prints no name for that
// place at its pin (16 label-absent positional/interpretive placements);
// scripts/check-pins.ts enforces that absence against its NO_LATIN allowlist
// rather than letting it slip through unnoticed.
const places: AtlasPlace[] = [
  { term: "Achaea", latin: "ACHAIA PROPRIA", x: 4760, y: 6035 },
  { term: "Aegae", x: 4880, y: 5985 },
  { term: "Alpheus", latin: "Alpheus flu.", x: 4120, y: 6680 },
  { term: "Amnisus", x: 7620, y: 7205 },
  { term: "Arcadia", noGloss: true, latin: "ARCADIA", x: 4660, y: 6695 },
  { term: "Arethusa", x: 3855, y: 5935 },
  { term: "Argos (the city)", label: "Argos", latin: "Argos", x: 5590, y: 6428 },
  { term: "Asteris", latin: "Asteria", x: 3745, y: 5720 },
  { term: "Athens", latin: "ATHENAE", x: 6450, y: 5830 },
  { term: "Attica", noGloss: true, latin: "ATTICA", x: 6700, y: 5800 },
  { term: "Boeotia", noGloss: true, latin: "BOEOTIA", x: 6170, y: 5465 },
  { term: "Chalcis", x: 4005, y: 6820 },
  { term: "Chios", latin: "CHIOS", x: 8190, y: 4640 },
  { term: "Crete", latin: "CRETA", x: 7040, y: 7345 },
  { term: "Crouni", x: 4070, y: 6885 },
  { term: "Cythera", latin: "Cythera", x: 5355, y: 7565 },
  { term: "Delos", latin: "Delos", x: 7830, y: 5725 },
  { term: "Elis", latin: "ELLIS", x: 4300, y: 6430 },
  { term: "Enipeus", x: 4680, y: 4560 },
  { term: "Ephyra", x: 3290, y: 5210 },
  { term: "Erymanthus", x: 4390, y: 6300 },
  { term: "Euboea", latin: "EVBOEA", x: 6820, y: 5180 },
  { term: "Geraestus", latin: "Gerestus", x: 7480, y: 5340 },
  { term: "Gortyn", latin: "Gortyna", x: 7310, y: 7420 },
  { term: "Gyrae", x: 7750, y: 5430 },
  { term: "Hyperesia", latin: "Aegira", x: 4985, y: 5965 },
  { term: "Iolcus", latin: "Iolcus", x: 5390, y: 4400 },
  { term: "Ismarus", latin: "Maronia", x: 6180, y: 2665 },
  { term: "Ithaca", latin: "Ithaca", x: 3830, y: 5795 },
  { term: "Knossos", latin: "Cnodos", x: 7560, y: 7270 },
  { term: "Laconia", noGloss: true, latin: "LACONIA", x: 4950, y: 7010 },
  { term: "Lemnos", latin: "LEMNOS", x: 6320, y: 3270 },
  { term: "Lesbos", latin: "LESBOS", x: 7850, y: 3920 },
  { term: "Malea", latin: "Malea pro.", x: 5645, y: 7320 },
  { term: "Marathon", latin: "Marathon", x: 6545, y: 5725 },
  { term: "Messenia", latin: "MESSENIA", x: 4300, y: 7060 },
  { term: "Mimas", latin: "Mimas M.", x: 8450, y: 4650 },
  { term: "Mount Neion", label: "Neion", x: 3875, y: 5860 },
  { term: "Mount Neriton", label: "Neriton", x: 3855, y: 5730 },
  { term: "Mount Parnassus", label: "Parnassus", latin: "Parnassus M.", x: 5170, y: 5250 },
  { term: "Mycenae", latin: "Mycenę", x: 5530, y: 6483 },
  { term: "Olympus", latin: "Olympus M.", x: 4700, y: 4400 },
  { term: "Orchomenus", latin: "Orchomenus", x: 5700, y: 5450 },
  { term: "Ossa", latin: "Ossa M.", x: 5250, y: 4290 },
  { term: "Panopeus", x: 5110, y: 5355 },
  { term: "Pelion", latin: "Pelius M.", x: 5470, y: 4450 },
  { term: "Peloponnese", noGloss: true, latin: "PELOPONNESVS", x: 4900, y: 6575 },
  { term: "Phaea", latin: "Ichtis", x: 3890, y: 6645 },
  { term: "Phaestus", x: 7200, y: 7550 },
  { term: "Pherae", latin: "Pherę", x: 4630, y: 7200 },
  { term: "Phthia", latin: "PHTHIOTIS", x: 5170, y: 4650 },
  { term: "Phylace", x: 5080, y: 4560 },
  { term: "Pieria", latin: "PIERIA", x: 4520, y: 4090 },
  { term: "Psara", latin: "Psyra", x: 8030, y: 4920 },
  { term: "Pylos", latin: "Pylus", x: 4210, y: 6990 },
  { term: "River Jardan", label: "Jardan", x: 6465, y: 7330 },
  { term: "Same", latin: "Samos", x: 3640, y: 5800 },
  { term: "Scyros", latin: "Scyros", x: 7105, y: 4570 },
  { term: "Sounion", latin: "Sunium pro.", x: 6855, y: 6090 },
  { term: "Sparta", latin: "Lacodemon", x: 5070, y: 6955 },
  { term: "Taphos", x: 3930, y: 5655 },
  { term: "Taygetus", latin: "Taygetus", x: 4660, y: 7140 },
  { term: "Tenedos", latin: "Tenedus", x: 7635, y: 3325 },
  { term: "Thebes", latin: "Thebę", x: 6440, y: 5403 },
  { term: "Thesprotia", latin: "THESPROTI.", x: 2770, y: 4745 },
  { term: "Thessaly", noGloss: true, latin: "THESSALIA", x: 4430, y: 4715 },
  { term: "Thrace", latin: "THRACIA", x: 5750, y: 2130 },
  { term: "Troy", latin: "Ilium", x: 7845, y: 3300 },
  { term: "Zacynthus", latin: "ZACHINTHVS", x: 3500, y: 6460 },
]

export const graeciaPlate: PlateConfig = {
  slug: "graecia",
  title: "Graecia Sophiani",
  w: 12325,
  h: 8913,
  maxZoom: 6,
  tileBase: "atlas/graecia",
  attribution: "Abraham Ortelius, Graecia Sophiani (1579) · Wikimedia Commons",
  places,
}
