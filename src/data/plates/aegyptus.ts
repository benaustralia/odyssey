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
// SEED GRID — the 2 places below are parked in open sea ("AEGYPTIVM MARE",
// top-left of the frame), NOT at their real location yet. Calibrate at
// #atlas/aegyptus-eyeball, then paste the JSON back over this array. Egypt
// and Pharos also have a home on rubri (the Red Sea plate) — this plate is
// their higher-fidelity second home, per the plan's redistribution notes.
const places: AtlasPlace[] = [
  { term: "Egypt", x: 1400, y: 1550 },
  { term: "Pharos", x: 1850, y: 1550 },
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
