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
// SEED GRID — every place below is parked in an alphabetized 10-per-row
// grid over the open Ionian/Laconian sea south of the Peloponnese, NOT at
// its real location yet. Calibrate at #atlas/graecia-eyeball (footer:
// search -> crosshair-focus -> drag -> "Copy all"), then paste the JSON
// back over this array. Once calibrated, these places leave rubri's inset
// cluster (see rubri.ts) and this plate becomes DEFAULT_PLATE_SLUG.
const places: AtlasPlace[] = [
  { term: "Achaea", noGloss: true, x: 2100, y: 6900 },
  { term: "Aegae", x: 2520, y: 6900 },
  { term: "Alpheus", noGloss: true, x: 2940, y: 6900 },
  { term: "Amnisus", x: 3360, y: 6900 },
  { term: "Arcadia", noGloss: true, x: 3780, y: 6900 },
  { term: "Arethusa", x: 4200, y: 6900 },
  { term: "Argos (the city)", label: "Argos", x: 4620, y: 6900 },
  { term: "Asteris", x: 5040, y: 6900 },
  { term: "Athens", x: 5460, y: 6900 },
  { term: "Attica", noGloss: true, x: 5880, y: 6900 },
  { term: "Boeotia", noGloss: true, x: 2100, y: 7130 },
  { term: "Chalcis", x: 2520, y: 7130 },
  { term: "Chios", x: 2940, y: 7130 },
  { term: "Crete", noGloss: true, x: 3360, y: 7130 },
  { term: "Crouni", noGloss: true, x: 3780, y: 7130 },
  { term: "Cythera", x: 4200, y: 7130 },
  { term: "Delos", x: 4620, y: 7130 },
  { term: "Elis", x: 5040, y: 7130 },
  { term: "Enipeus", noGloss: true, x: 5460, y: 7130 },
  { term: "Ephyra", x: 5880, y: 7130 },
  { term: "Erymanthus", x: 2100, y: 7360 },
  { term: "Euboea", x: 2520, y: 7360 },
  { term: "Geraestus", x: 2940, y: 7360 },
  { term: "Gortyn", x: 3360, y: 7360 },
  { term: "Gyrae", x: 3780, y: 7360 },
  { term: "Hyperesia", x: 4200, y: 7360 },
  { term: "Iolcus", x: 4620, y: 7360 },
  { term: "Ismarus", x: 5040, y: 7360 },
  { term: "Ithaca", x: 5460, y: 7360 },
  { term: "Knossos", noGloss: true, x: 5880, y: 7360 },
  { term: "Laconia", noGloss: true, x: 2100, y: 7590 },
  { term: "Lemnos", x: 2520, y: 7590 },
  { term: "Lesbos", x: 2940, y: 7590 },
  { term: "Malea", x: 3360, y: 7590 },
  { term: "Marathon", x: 3780, y: 7590 },
  { term: "Messenia", x: 4200, y: 7590 },
  { term: "Mimas", x: 4620, y: 7590 },
  { term: "Mount Neion", label: "Neion", x: 5040, y: 7590 },
  { term: "Mount Neriton", label: "Neriton", x: 5460, y: 7590 },
  { term: "Mount Parnassus", label: "Parnassus", x: 5880, y: 7590 },
  { term: "Mycenae", x: 2100, y: 7820 },
  { term: "Olympus", x: 2520, y: 7820 },
  { term: "Orchomenus", x: 2940, y: 7820 },
  { term: "Ossa", x: 3360, y: 7820 },
  { term: "Panopeus", x: 3780, y: 7820 },
  { term: "Pelion", x: 4200, y: 7820 },
  { term: "Peloponnese", noGloss: true, x: 4620, y: 7820 },
  { term: "Phaea", x: 5040, y: 7820 },
  { term: "Phaestus", x: 5460, y: 7820 },
  { term: "Pherae", x: 5880, y: 7820 },
  { term: "Phthia", x: 2100, y: 8050 },
  { term: "Phylace", x: 2520, y: 8050 },
  { term: "Pieria", x: 2940, y: 8050 },
  { term: "Psara", x: 3360, y: 8050 },
  { term: "Pylos", x: 3780, y: 8050 },
  { term: "River Jardan", label: "Jardan", x: 4200, y: 8050 },
  { term: "Same", x: 4620, y: 8050 },
  { term: "Scyros", x: 5040, y: 8050 },
  { term: "Sounion", x: 5460, y: 8050 },
  { term: "Sparta", x: 5880, y: 8050 },
  { term: "Taphos", x: 2100, y: 8280 },
  { term: "Taygetus", x: 2520, y: 8280 },
  { term: "Tenedos", x: 2940, y: 8280 },
  { term: "Thebes", noGloss: true, x: 3360, y: 8280 },
  { term: "Thesprotia", x: 3780, y: 8280 },
  { term: "Thessaly", noGloss: true, x: 4200, y: 8280 },
  { term: "Thrace", x: 4620, y: 8280 },
  { term: "Troy", x: 5040, y: 8280 },
  { term: "Zacynthus", x: 5460, y: 8280 },
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
