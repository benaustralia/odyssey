import galleyUrl from "../../assets/black-hulled-galley.svg"
import raftUrl from "../../assets/raft.svg"
import swimmerUrl from "../../assets/swimmer.svg"
import type { JourneyConfig, Pt, Stop } from "./types"

// Base map: Abraham Ortelius, "Vlyssis Errores" (1597) — the wide inset cropped
// from a 13238px public-domain scan of his Red Sea plate. Native master is
// 3600x2279 on Cloudinary. Pin coords below are in this image's pixel space.
const MAP_CLD = "cdll9uth8di3xcsh8djn"
// Pin the asset version so browsers fetch the latest crop instead of a cached
// copy (bump this when the map image is re-uploaded).
const MAP_VER = "v1781683903"

// The 14 canonical stops of Odysseus's voyage (after Stephen Fry's map), each
// pinned where Ortelius drew it, linked to its glossary `term` — plus one
// extra, non-canonical stop: Book 12 has Odysseus land back on Aeaea a second
// time (not just sail past it) to bury Elpenor and get Circe's final sailing
// directions, so it's pinned as a real, clickable stop reusing the "Circe"
// term (same island, same glossary entry) rather than a numbered Fry stop.
const stops: Stop[] = [
  { n: 1, term: "Troy", label: "Troy", short: "Troy", zh: "特洛伊", x: 3278, y: 956 },
  { n: 2, term: "Cicones", label: "Ismarus · the Cicones", short: "Cicones", zh: "客科涅斯人", x: 3058, y: 847 },
  { n: 3, term: "Lotus-Eaters", label: "Land of the Lotus-Eaters", short: "Lotus-Eaters", zh: "食莲族", x: 917, y: 1860 },
  { n: 4, term: "Cyclops (pl. Cyclopes)", label: "Land of the Cyclopes", short: "Cyclopes", zh: "库克罗普斯", x: 1059, y: 1659 },
  { n: 5, term: "Aeolus", label: "Aeolia · Island of Aeolus", short: "Aeolus", zh: "埃俄罗斯", x: 984, y: 1495 },
  { n: 6, term: "Laestrygonians", label: "Telepylos · the Laestrygonians", short: "Laestrygonians", zh: "莱斯特律戈涅斯人", x: 887, y: 969 },
  { n: 7, term: "Circe", label: "Aeaea · Circe's island", short: "Circe", zh: "喀耳刻", x: 838, y: 1000 },
  { n: 8, term: "Hades", label: "The Underworld", short: "Underworld", zh: "哈得斯", x: 1075, y: 1089 },
  { n: 9, term: "Circe", label: "Aeaea · Elpenor's Burial", short: "Elpenor's Burial", zh: "埃埃亚 · 安葬厄尔佩诺耳", x: 855, y: 1005 },
  { n: 10, term: "Sirens", label: "The Sirens", short: "Sirens", zh: "塞壬", x: 842, y: 1109 },
  { n: 11, term: "Scylla", label: "Scylla & Charybdis", short: "Scylla & Charybdis", zh: "斯库拉与卡律布狄斯", x: 1139, y: 1541 },
  { n: 12, term: "Thrinacia", label: "Thrinacia · Island of Helios", short: "Thrinacia", zh: "特里那基亚", x: 1028, y: 1739 },
  { n: 13, term: "Ogygia", label: "Ogygia · Calypso's island", short: "Ogygia", zh: "俄古癸亚", x: 1493, y: 1406 },
  { n: 14, term: "Scheria", label: "Scheria · the Phaeacians", short: "Scheria", zh: "斯刻里亚", x: 1908, y: 1411 },
  { n: 15, term: "Ithaca", label: "Ithaca · home", short: "Ithaca", zh: "伊塔卡", x: 2105, y: 1677 },
]

// Per-leg sea-routing waypoints: legVias[i] bends the line from stops[i] to
// i+1 around land. Empty = straight. (Populated from the calibration tool.)
const legVias: Pt[][] = [
  // 1→2  Troy → Cicones
  [{ x: 3195, y: 1030 }, { x: 3138, y: 1015 }, { x: 3107, y: 985 }, { x: 3098, y: 926 }],
  // 2→3  Cicones → Lotus-Eaters: thread the Aegean channels down past Cape
  // Malea & Cythera, then the nine-day storm-drift across open sea to Libya
  [
    { x: 2965, y: 907 }, { x: 2859, y: 882 }, { x: 2840, y: 1050 }, { x: 2700, y: 1113 },
    { x: 2633, y: 1217 }, { x: 2570, y: 1406 }, { x: 2738, y: 1509 }, { x: 2705, y: 1613 },
    { x: 2660, y: 1667 }, { x: 2614, y: 1803 }, { x: 2662, y: 1845 }, { x: 2674, y: 1925 },
    { x: 2591, y: 1928 }, { x: 2495, y: 1999 }, { x: 2395, y: 2050 }, { x: 2196, y: 2056 },
    { x: 1500, y: 2080 }, { x: 1080, y: 1960 }, { x: 991, y: 1959 },
  ],
  // 3→4  Lotus-Eaters → Cyclopes: round the headland through open water
  [{ x: 1048, y: 1881 }, { x: 1078, y: 1775 }],
  // 4→5  Cyclopes → Aeolus
  [{ x: 1143, y: 1613 }, { x: 1133, y: 1539 }, { x: 1109, y: 1509 }],
  // 5→6  Aeolus → Laestrygonians: up the western sea
  [{ x: 805, y: 1204 }, { x: 872, y: 1036 }],
  // 6→7  Laestrygonians → Circe (adjacent)
  [],
  // 7→8  Circe → Hades: out to the Cimmerian shore (Underworld excursion)
  [{ x: 848, y: 1009 }, { x: 889, y: 1030 }, { x: 926, y: 1053 }, { x: 967, y: 1060 }, { x: 993, y: 1049 }, { x: 1004, y: 1065 }, { x: 1020, y: 1094 }],
  // 8→9  Hades → Aeaea, again: sail home to Circe's island to bury Elpenor
  [{ x: 1024, y: 1084 }, { x: 1005, y: 1050 }, { x: 984, y: 1044 }, { x: 943, y: 1046 }],
  // 9→10 Aeaea, again → Sirens: Circe's final sailing-orders, then out past the Sirens
  [{ x: 848, y: 1019 }],
  // 10→11 Sirens → Scylla & Charybdis
  [{ x: 980, y: 1330 }],
  // 11→12 Scylla → Thrinacia: short hop down to the Sicilian coast by the strait
  [{ x: 1106, y: 1704 }],
  // 12→13 Thrinacia → Ogygia: wrecked, swept BACK past Charybdis, then adrift
  [
    { x: 1098, y: 1695 }, { x: 1156, y: 1626 }, { x: 1173, y: 1633 }, { x: 1216, y: 1627 },
    { x: 1268, y: 1614 }, { x: 1340, y: 1470 }, { x: 1446, y: 1435 },
  ],
  // 13→14 Ogygia → Scheria: steady steering by the stars for the first
  // stretch (Calypso's sailing directions), then Poseidon's storm knocks the
  // raft off course in sight of land — the last two vias jog backward before
  // the wreck washes up at Scheria, breaking the smooth "sailed" bow the
  // other legs have.
  [{ x: 1662, y: 1309 }, { x: 1815, y: 1248 }, { x: 1885, y: 1300 }, { x: 1825, y: 1360 }],
  // 14→15 Scheria → Ithaca: the Phaeacian run home
  [{ x: 2010, y: 1560 }],
]

export const odysseusJourney: JourneyConfig = {
  slug: "odysseus",
  title: "The Journey of Odysseus",
  attribution: { prefix: "Abraham Ortelius, ", workTitle: "Vlyssis Errores", suffix: " (1597)" },
  mapWidth: 4000,
  mapHeight: 2337,
  mapUrl: `https://res.cloudinary.com/dhvvz91bh/image/upload/f_auto,q_auto,c_limit,w_3000/${MAP_VER}/${MAP_CLD}`,
  vessel: { svgUrl: galleyUrl, alt: "Odysseus's ship" },
  stops,
  legVias,
  // The one leg of the voyage Odysseus makes on a raft, not the ship: swept
  // from the wreck at Thrinacia by raft to Ogygia, then Calypso builds him a
  // raft for the Ogygia → Scheria leg — but Poseidon's storm breaks it up
  // partway across (at via index 3, the last of the "swept back" bend points),
  // so he swims the rest of the way in.
  specialLegs: [
    {
      fromTerm: "Ogygia",
      toTerm: "Scheria",
      routeClassName: "journey-route-raft",
      stages: [
        { svgUrl: raftUrl, alt: "Odysseus's raft", uptoViaIndex: 3, pauseAfterMs: 900 },
        { svgUrl: swimmerUrl, alt: "Odysseus swimming", uptoViaIndex: -1 },
      ],
    },
  ],
  // Tour cadence. Each stop occupies (glide-in + a fixed dwell). The glide is
  // paced by on-screen pixels so a leg's speed is consistent, clamped so it's
  // neither a crawl nor a lurch — note the Cicones→Lotus-Eaters leg is ~6800px
  // vs ~700px for most, so without the cap it would either crawl or whip.
  tuning: {
    tourZoom: 1, // how far to zoom in on each stop during the guided tour
    labelZoom: -0.6, // reveal place-name labels once zoomed in past this
    tourPps: 150, // glide speed: screen px per second
    glideMin: 3500,
    glideMax: 11000,
    dwellMs: 3500, // pause on each stop after the camera arrives
    jumpMs: 900, // flyTo duration for the first stop / non-adjacent jumps
  },
}
