import galleyUrl from "../../assets/black-hulled-galley.svg"
import chariotUrl from "../../assets/chariot.svg"
import type { JourneyConfig, Pt, Stop } from "./types"

// Base map: a crop of Abraham Ortelius's "Graecia Sophiani" plate (the
// Atlas's `graecia` plate — real cartographic-scale mainland Greece), NOT the
// Vlyssis Errores inset Odysseus's map uses. That inset was deliberately
// pruned of mainland-Greek pins (2026-08-07 "Phase 0") because graecia shows
// them more accurately, and it has no Pylos/Sparta pins at all. Cropped from
// plates/graecia/master.jpg, box (2350,5250)-(6200,8050) — coords below are
// graecia's own pin pixels minus that crop origin (a pure translation, no
// scale), so they line up with the already-calibrated graecia pins for
// Ithaca/Pylos/Sparta/Asteris (src/data/plates/graecia.ts).
const MAP_URL = "https://pub-b57180e24c9841f58854ecd1c164523a.r2.dev/art/map-telemachus.jpg"

// Telemachus's search for news of his father (Odyssey Books 1-4 & 15):
// Ithaca -> Pylos (Nestor) -> Sparta (Menelaus & Helen) -> home, narrowly
// sailing past the suitors' ambush at Asteris to land secretly near
// Eumaeus's hut rather than the main harbor. 5 stops: Ithaca appears twice
// (departure and the disguised return), same pattern as Odysseus's Aeaea
// revisit -- two different Stop entries reusing similar geography, not the
// same coordinates, since Book 15 is explicit he lands somewhere else.
const stops: Stop[] = [
  { n: 1, term: "Ithaca", label: "Ithaca · Telemachus Sets Sail", short: "Ithaca", zh: "伊塔卡", x: 1480, y: 545 },
  { n: 2, term: "Pylos", label: "Pylos · the Palace of Nestor", short: "Pylos", zh: "皮洛斯", x: 1860, y: 1740 },
  { n: 3, term: "Sparta", label: "Sparta · Menelaus and Helen", short: "Sparta", zh: "斯巴达", x: 2720, y: 1705 },
  { n: 4, term: "Asteris", label: "Asteris · the Suitors' Ambush", short: "Asteris", zh: "阿斯特里斯", x: 1395, y: 470 },
  { n: 5, term: "Eumaeus", label: "Ithaca · the Swineherd's Hut", short: "Eumaeus's Hut", zh: "欧迈俄斯的小屋", x: 1525, y: 605 },
]

// Per-leg waypoints, drafted offline against the cropped master (PIL
// grid-crops + a drawn-polyline verification pass, same method as the
// graecia pin drafting) rather than the live #journey/edit calibration tool:
// checked each leg stays in open water / crosses plausible interior terrain
// without cutting across a landmass or island it shouldn't.
const legVias: Pt[][] = [
  // 1->2 Ithaca -> Pylos: out through the strait west of Ithaca, south down
  // the open Ionian Sea past Cephalonia and Zacynthus, into Pylos's bay.
  [
    { x: 1350, y: 600 }, { x: 1280, y: 720 }, { x: 1140, y: 980 },
    { x: 1080, y: 1280 }, { x: 1130, y: 1560 }, { x: 1350, y: 1700 },
  ],
  // 2->3 Pylos -> Sparta: overland by chariot across the southern
  // Peloponnese, fording the Pamisus valley toward Lacedaemon.
  [{ x: 2050, y: 1600 }, { x: 2320, y: 1630 }, { x: 2520, y: 1670 }],
  // 3->4 Sparta -> Asteris: chariot back to the Pylos coast (a slightly
  // different inland line than the outbound leg), then by ship north past
  // Zacynthus and Cephalonia to the strait where the suitors lie in wait.
  [
    { x: 2520, y: 1670 }, { x: 2280, y: 1650 }, { x: 2020, y: 1690 }, { x: 1860, y: 1740 },
    { x: 1600, y: 1660 }, { x: 1330, y: 1480 }, { x: 1130, y: 1230 },
    { x: 1080, y: 950 }, { x: 1180, y: 700 }, { x: 1320, y: 560 },
  ],
  // 4->5 Asteris -> Eumaeus: slips past the ambush point and rounds the
  // eastern side of Ithaca to a secret cove, away from the main harbor.
  [{ x: 1490, y: 460 }, { x: 1580, y: 550 }],
]

export const telemachusJourney: JourneyConfig = {
  slug: "telemachus",
  title: "The Journey of Telemachus",
  heroImage: "/journey-map-telemachus.webp",
  heroAlt: "Abraham Ortelius's map of Graecia Sophiani",
  heroCta: "Follow the Telemachus journey",
  attribution: { prefix: "Abraham Ortelius, ", workTitle: "Graecia Sophiani", suffix: " (1595)" },
  mapWidth: 3850,
  mapHeight: 2800,
  mapUrl: MAP_URL,
  vessel: { svgUrl: galleyUrl, alt: "Telemachus's ship" },
  stops,
  legVias,
  // Two overland legs by chariot (Book 3-4): Pylos<->Sparta has no sea
  // portion at all, so it's a single-stage specialLeg riding the chariot the
  // whole way. Sparta->Asteris is chariot-then-ship, same two-stage shape as
  // Odysseus's raft->swimmer leg -- the boundary (uptoViaIndex 3) lands the
  // swap where the chariot route reaches the Pylos coast.
  specialLegs: [
    {
      fromTerm: "Pylos",
      toTerm: "Sparta",
      stages: [{ svgUrl: chariotUrl, alt: "Telemachus's chariot", uptoViaIndex: -1 }],
    },
    {
      fromTerm: "Sparta",
      toTerm: "Asteris",
      stages: [
        { svgUrl: chariotUrl, alt: "Telemachus's chariot", uptoViaIndex: 3, pauseAfterMs: 900 },
        { svgUrl: galleyUrl, alt: "Telemachus's ship", uptoViaIndex: -1 },
      ],
    },
  ],
  tuning: {
    tourZoom: 1,
    labelZoom: -0.6,
    tourPps: 150,
    glideMin: 3500,
    glideMax: 11000,
    dwellMs: 3500,
    jumpMs: 900,
  },
}
