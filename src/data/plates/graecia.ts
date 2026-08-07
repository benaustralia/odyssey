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
// by reading the master scan at native resolution (per-pin confidence +
// evidence in graecia-draft/flags.md). Flag review RESOLVED 2026-08-07 (see
// flags.md "Review resolution"): Argos<->Mycenae exchanged onto their own
// engraved labels ("Argos." names the NE castle, the diagonal "Mycene." the
// SW one); Phylace moved off the Pierian homonym label to the Thessalian
// position per Wilson's def; Chalcis/Crouni/Enipeus/Gyrae confirmed.
// Adjust any pin at #atlas/graecia/edit (drag -> "Copy all" -> paste back
// over this array).
const places: AtlasPlace[] = [
  { term: "Achaea", noGloss: true, x: 4760, y: 6035 },
  { term: "Aegae", x: 4880, y: 5985 },
  { term: "Alpheus", noGloss: true, x: 4120, y: 6680 },
  { term: "Amnisus", x: 7620, y: 7205 },
  { term: "Arcadia", noGloss: true, x: 4660, y: 6695 },
  { term: "Arethusa", x: 3855, y: 5935 },
  { term: "Argos (the city)", label: "Argos", x: 5590, y: 6428 },
  { term: "Asteris", x: 3745, y: 5720 },
  { term: "Athens", x: 6450, y: 5830 },
  { term: "Attica", noGloss: true, x: 6700, y: 5800 },
  { term: "Boeotia", noGloss: true, x: 6170, y: 5465 },
  { term: "Chalcis", x: 4005, y: 6820 },
  { term: "Chios", x: 8190, y: 4640 },
  { term: "Crete", noGloss: true, x: 7040, y: 7345 },
  { term: "Crouni", noGloss: true, x: 3985, y: 6870 },
  { term: "Cythera", x: 5355, y: 7565 },
  { term: "Delos", x: 7830, y: 5725 },
  { term: "Elis", x: 4300, y: 6430 },
  { term: "Enipeus", noGloss: true, x: 4680, y: 4560 },
  { term: "Ephyra", x: 3290, y: 5210 },
  { term: "Erymanthus", x: 4390, y: 6300 },
  { term: "Euboea", x: 6820, y: 5180 },
  { term: "Geraestus", x: 7480, y: 5340 },
  { term: "Gortyn", x: 7310, y: 7420 },
  { term: "Gyrae", x: 7750, y: 5430 },
  { term: "Hyperesia", x: 4985, y: 5965 },
  { term: "Iolcus", x: 5390, y: 4400 },
  { term: "Ismarus", x: 6180, y: 2665 },
  { term: "Ithaca", x: 3830, y: 5795 },
  { term: "Knossos", noGloss: true, x: 7560, y: 7270 },
  { term: "Laconia", noGloss: true, x: 4950, y: 7010 },
  { term: "Lemnos", x: 6320, y: 3270 },
  { term: "Lesbos", x: 7850, y: 3920 },
  { term: "Malea", x: 5645, y: 7320 },
  { term: "Marathon", x: 6545, y: 5725 },
  { term: "Messenia", x: 4300, y: 7060 },
  { term: "Mimas", x: 8450, y: 4650 },
  { term: "Mount Neion", label: "Neion", x: 3875, y: 5860 },
  { term: "Mount Neriton", label: "Neriton", x: 3855, y: 5730 },
  { term: "Mount Parnassus", label: "Parnassus", x: 5170, y: 5250 },
  { term: "Mycenae", x: 5530, y: 6483 },
  { term: "Olympus", x: 4700, y: 4400 },
  { term: "Orchomenus", x: 5700, y: 5450 },
  { term: "Ossa", x: 5250, y: 4290 },
  { term: "Panopeus", x: 5110, y: 5355 },
  { term: "Pelion", x: 5470, y: 4450 },
  { term: "Peloponnese", noGloss: true, x: 4900, y: 6575 },
  { term: "Phaea", x: 3890, y: 6645 },
  { term: "Phaestus", x: 7200, y: 7550 },
  { term: "Pherae", x: 4630, y: 7200 },
  { term: "Phthia", x: 5170, y: 4650 },
  { term: "Phylace", x: 5080, y: 4560 },
  { term: "Pieria", x: 4520, y: 4090 },
  { term: "Psara", x: 8030, y: 4920 },
  { term: "Pylos", x: 4210, y: 6990 },
  { term: "River Jardan", label: "Jardan", x: 6465, y: 7330 },
  { term: "Same", x: 3640, y: 5800 },
  { term: "Scyros", x: 7105, y: 4570 },
  { term: "Sounion", x: 6855, y: 6090 },
  { term: "Sparta", x: 5070, y: 6955 },
  { term: "Taphos", x: 3930, y: 5655 },
  { term: "Taygetus", x: 4660, y: 7140 },
  { term: "Tenedos", x: 7635, y: 3325 },
  { term: "Thebes", noGloss: true, x: 6315, y: 5450 },
  { term: "Thesprotia", x: 2770, y: 4745 },
  { term: "Thessaly", noGloss: true, x: 4430, y: 4715 },
  { term: "Thrace", x: 5750, y: 2130 },
  { term: "Troy", x: 7845, y: 3300 },
  { term: "Zacynthus", x: 3500, y: 6460 },
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
