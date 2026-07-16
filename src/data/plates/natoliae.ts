import type { AtlasPlace, PlateConfig } from "./types"

// Abraham Ortelius, "Natoliae, Quae Olim Asia Minor, Nova Descriptio"
// (1570) — Asia Minor from the Bosphorus down to Rhodes/Karpathos/Crete
// (all three drawn at the bottom of the frame), with Cyprus at the far
// right edge. Source scan: Wikimedia Commons "Natoliae Quae Olim Asia
// Minor Nova Descriptio.jpg", 5560x7725; local master at
// plates/natoliae/master.jpg (git-ignored).
//
// Frame audit: the frame reaches Cyprus ("CIPRVS INSVLA", fully drawn at
// the right edge) and Crete ("CANDIA INSVLA OLIM CRETA", bottom-right
// corner), so it comfortably covers the southwestern Anatolian coast where
// ancient Lycia sits (Mount Solyma's home per the glossary) — that coast
// is on the plate, though this edition prints the later Ottoman sanjak
// names (Mentese, Aldineli) there rather than "Lycia" itself. No watermark,
// frame intact.
//
// SEED GRID — the 4 places below are parked in open water in the "MARIS
// MEDITERRANEI PARS" label area, NOT at their real location yet. Calibrate
// at #atlas/natoliae-eyeball, then paste the JSON back over this array.
// Troy also has a home on rubri (the Vlyssis Errores inset).
const places: AtlasPlace[] = [
  { term: "Mimas", x: 3860, y: 3750 },
  { term: "Mount Solyma", label: "Solyma", x: 4030, y: 3750 },
  { term: "Tenedos", x: 3860, y: 3920 },
  { term: "Troy", x: 4030, y: 3920 },
]

export const natoliaePlate: PlateConfig = {
  slug: "natoliae",
  title: "Natoliae",
  w: 5560,
  h: 7725,
  maxZoom: 5,
  tileBase: "atlas/natoliae",
  attribution: "Abraham Ortelius, Natoliae Quae Olim Asia Minor Nova Descriptio (1570) · Wikimedia Commons",
  places,
}
