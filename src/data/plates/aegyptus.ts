import type { AtlasPlace, PlateConfig } from "./types"

// Abraham Ortelius, "Aegyptus Antiqua" (1584) — a dedicated close-up of the
// Nile valley from the Delta down to "AETHIOPIAE SVB AEGYPTO PARS" at the
// southern edge, at far higher fidelity than the Red Sea plate's incidental
// coverage. Source scan: Wikimedia Commons "1584 Aegyptus Antiqua by
// Abraham Ortelius, from the Digital Commonwealth - commonwealth
// cj82kx52v.jpg", 6498x9896; local master at plates/aegyptus/master.jpg
// (git-ignored).
//
// Frame audit: Egypt is the plate's whole subject ("AEGYPTVS" main body,
// Alexandria in its own inset box top-left). No watermark; one faint
// horizontal fold-crease mid-page from the source book scan, not a defect.
//
// CALIBRATED 2026-08-07 (offline PIL grid-crops of the master at native
// resolution, verified with marked-ring crops — same method as Graecia):
// - Egypt sits on the "YP" of the plate's own printed "AEGYPTVS INFERIOR"
//   regional label across the Delta, beside the Menelaites nome (apt).
// - Pharos sits on the island town symbol labelled "Pharos colonia" inside
//   the "ALEXANDRINOR. NOMVS" inset box (left of centre) — Ortelius drew
//   that inset precisely because the main plate couldn't hold the detail
//   ("Huius Nomi loca omnia, quia ipsa tabula capere non poterat"), so the
//   inset IS this plate's highest-fidelity depiction of the island; the
//   "Pharos turris" lighthouse is labelled just east of the pin.
// Egypt and Pharos also have a home on rubri (the Red Sea plate) — this
// plate is their higher-fidelity second home.
const places: AtlasPlace[] = [
  { term: "Egypt", x: 3030, y: 2270 },
  { term: "Pharos", x: 1163, y: 3179 },
]

export const aegyptusPlate: PlateConfig = {
  slug: "aegyptus",
  title: "Aegyptus Antiqua",
  w: 6498,
  h: 9896,
  maxZoom: 6,
  tileBase: "atlas/aegyptus",
  attribution: "Abraham Ortelius, Aegyptus Antiqua (1584) · Wikimedia Commons",
  places,
}
