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
// CALIBRATED 2026-08-07 (offline PIL grid-crops of the master at native
// resolution, marked-ring verified — see CLAUDE.md TODO 1b). Orientation is
// standard north-up (SEPTENTRIO top, MERIDIES bottom). Phoenicia rides the
// "T. PHOENICIVM" region label printed over the sea off the Tyre-Sidon
// coast; Sidon sits on its own city symbol just south of the "SIDON." label.
const places: AtlasPlace[] = [
  { term: "Phoenicia", latin: "PHOENICIVM", x: 5015, y: 990 },
  { term: "Sidon", latin: "SIDON", x: 5690, y: 910 },
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
