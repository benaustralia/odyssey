import type { AtlasPlace, PlateConfig } from "./types"

// Abraham Ortelius, "Palestinae Sive Totius Terrae Promissionis Nova
// Descriptio" (1579, by Tilemann Stella) — the Levant coast the Red Sea
// plate cuts off before reaching (its frame stops at "Hierusalem"). Source
// scan: Wikimedia Commons "Abraham Ortelius, Palestinae sive totius Terrae
// Promissionis nova descriptio (FL200820524 2368827).jpg", 8000x6144; local
// master at plates/palestinae/master.jpg (git-ignored).
//
// Frame audit: Phoenicia ("PHOENICIVM") and Sidon are both labelled along
// the northern coast near the top edge, confirming the plan's redistribution
// target. Cyprus is NOT drawn — the "MEDITERRANEI PARS" sea area at that
// latitude stops short of the island, so Cyprus stays pinned on rubri only.
// No watermark, frame intact.
//
// SEED GRID — the 2 places below are parked in open sea near the title
// cartouche ("MARE AEGYPTIVM"), NOT at their real location yet. Calibrate
// at #atlas/palestinae-eyeball, then paste the JSON back over this array.
const places: AtlasPlace[] = [
  { term: "Phoenicia", x: 1260, y: 2860 },
  { term: "Sidon", x: 1490, y: 2860 },
]

export const palestinaePlate: PlateConfig = {
  slug: "palestinae",
  title: "Palestinae",
  w: 8000,
  h: 6144,
  maxZoom: 5,
  tileBase: "atlas/palestinae",
  attribution: "Abraham Ortelius, Palestinae sive totius Terrae Promissionis nova descriptio (1579) · Wikimedia Commons",
  places,
}
