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
// CALIBRATED 2026-08-07 (offline PIL grid-crops of the master at native
// resolution, marked-ring verified — see CLAUDE.md TODO 1b, which needed
// this plate's real positions to harvest Latin toponyms). Orientation is
// rotated on this sheet: East ("ORIENS") is at the TOP, West at the bottom,
// North on the left margin, South on the right — confirmed against the
// Black Sea/Euphrates/Cyprus labels before placing anything. Troy also has
// a home on rubri (the Vlyssis Errores inset).
const places: AtlasPlace[] = [
  { term: "Mimas", x: 3170, y: 6270 },
  { term: "Mount Solyma", label: "Solyma", x: 3700, y: 4200 },
  { term: "Tenedos", latin: "Tenedo", x: 2225, y: 6625 },
  { term: "Troy", latin: "TROIA", x: 2255, y: 6405 },
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
