import { useEffect, useMemo, useRef, useState } from "react"
import L from "leaflet"
import { MapContainer, ImageOverlay, Marker, Tooltip, Popup, Polyline, useMap, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
// @ts-expect-error - leaflet-minimap ships no type declarations
import MiniMapControl from "leaflet-minimap"
import "leaflet-minimap/dist/Control.MiniMap.min.css"

// Base map: Abraham Ortelius, "Vlyssis Errores" (1597) — the wide inset cropped
// from a 13238px public-domain scan of his Red Sea plate. Native master is
// 3600x2279 on Cloudinary. Pin coords below are in this image's pixel space.
const W = 4000
const H = 2337
const MAP_CLD = "cdll9uth8di3xcsh8djn"
// Pin the asset version so browsers fetch the latest crop instead of a cached
// copy (bump this when the map image is re-uploaded).
const MAP_VER = "v1781683903"
const MAP_URL = `https://res.cloudinary.com/dhvvz91bh/image/upload/f_auto,q_auto,c_limit,w_3000/${MAP_VER}/${MAP_CLD}`
const TOUR_ZOOM = 1 // how far to zoom in on each stop during the guided tour
const LABEL_ZOOM = -0.6 // reveal place-name labels once zoomed in past this

// Leaflet CRS.Simple has lat increasing upward, so flip the image-space y
// (measured from the top-left, the way we read it off the grid overlay).
const yx = (x: number, y: number): L.LatLngTuple => [H - y, x]
const bounds = L.latLngBounds([0, 0], [H, W])

// The 14 canonical stops of Odysseus's voyage (after Stephen Fry's map),
// each pinned where Ortelius drew it, linked to its glossary `term`.
type Stop = { n: number; term: string; label: string; short: string; zh: string; x: number; y: number }
const STOPS: Stop[] = [
  { n: 1, term: "Troy", label: "Troy", short: "Troy", zh: "特洛伊", x: 3278, y: 956 },
  { n: 2, term: "Cicones", label: "Ismarus · the Cicones", short: "Cicones", zh: "客科涅斯人", x: 3058, y: 847 },
  { n: 3, term: "Lotus-Eaters", label: "Land of the Lotus-Eaters", short: "Lotus-Eaters", zh: "食莲族", x: 917, y: 1860 },
  { n: 4, term: "Cyclops (pl. Cyclopes)", label: "Land of the Cyclopes", short: "Cyclopes", zh: "库克罗普斯", x: 1059, y: 1659 },
  { n: 5, term: "Aeolus", label: "Aeolia · Island of Aeolus", short: "Aeolus", zh: "埃俄罗斯", x: 984, y: 1495 },
  { n: 6, term: "Laestrygonians", label: "Telepylos · the Laestrygonians", short: "Laestrygonians", zh: "莱斯特律戈涅斯人", x: 887, y: 969 },
  { n: 7, term: "Circe", label: "Aeaea · Circe's island", short: "Circe", zh: "喀耳刻", x: 850, y: 1003 },
  { n: 8, term: "Hades", label: "The Underworld", short: "Underworld", zh: "哈得斯", x: 1075, y: 1089 },
  { n: 9, term: "Sirens", label: "The Sirens", short: "Sirens", zh: "塞壬", x: 842, y: 1109 },
  { n: 10, term: "Scylla", label: "Scylla & Charybdis", short: "Scylla & Charybdis", zh: "斯库拉与卡律布狄斯", x: 1139, y: 1541 },
  { n: 11, term: "Thrinacia", label: "Thrinacia · Island of Helios", short: "Thrinacia", zh: "特里那基亚", x: 1028, y: 1739 },
  { n: 12, term: "Ogygia", label: "Ogygia · Calypso's island", short: "Ogygia", zh: "俄古癸亚", x: 1493, y: 1406 },
  { n: 13, term: "Scheria", label: "Scheria · the Phaeacians", short: "Scheria", zh: "斯刻里亚", x: 1908, y: 1411 },
  { n: 14, term: "Ithaca", label: "Ithaca · home", short: "Ithaca", zh: "伊塔卡", x: 2105, y: 1677 },
]

type Pt = { x: number; y: number }

// Per-leg sea-routing waypoints: LEG_VIAS[i] bends the line from STOP i to i+1
// around land. Empty = straight. (Populated from the calibration tool.)
const LEG_VIAS: Pt[][] = [
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
  [{ x: 849, y: 1003 }, { x: 926, y: 1053 }, { x: 967, y: 1060 }, { x: 993, y: 1049 }, { x: 1004, y: 1065 }, { x: 1020, y: 1094 }],
  // 8→9  Hades → Sirens: sail home to Aeaea (the SECOND visit to Circe, to bury
  // Elpenor & get her sailing-orders), then out past the Sirens
  [{ x: 1024, y: 1084 }, { x: 1005, y: 1050 }, { x: 984, y: 1044 }, { x: 943, y: 1046 }, { x: 888, y: 1005 }, { x: 848, y: 1019 }],
  // 9→10 Sirens → Scylla & Charybdis
  [{ x: 980, y: 1330 }],
  // 10→11 Scylla → Thrinacia: short hop down to the Sicilian coast by the strait
  [{ x: 1106, y: 1704 }],
  // 11→12 Thrinacia → Ogygia: wrecked, swept BACK past Charybdis, then adrift
  [
    { x: 1098, y: 1695 }, { x: 1156, y: 1626 }, { x: 1173, y: 1633 }, { x: 1216, y: 1627 },
    { x: 1268, y: 1614 }, { x: 1340, y: 1470 }, { x: 1446, y: 1435 },
  ],
  // 12→13 Ogygia → Scheria
  [{ x: 1662, y: 1309 }, { x: 1815, y: 1248 }],
  // 13→14 Scheria → Ithaca: the Phaeacian run home
  [{ x: 2010, y: 1560 }],
]

// Centripetal Catmull-Rom spline → smooth sailing curve through the control
// points. Centripetal (alpha=0.5) avoids the overshoot/loops that uniform
// Catmull-Rom produces when point spacing is very uneven. Returns dense points.
const smooth = (pts: Pt[], seg = 18): Pt[] => {
  const n = pts.length
  if (n < 3) return pts
  const a = 0.5
  const pad = [pts[0], ...pts, pts[n - 1]] // duplicate ends for tangents
  const dist = (p: Pt, q: Pt) => Math.pow(Math.hypot(q.x - p.x, q.y - p.y), a) || 1e-5
  const out: Pt[] = []
  for (let i = 1; i < pad.length - 2; i++) {
    const p0 = pad[i - 1],
      p1 = pad[i],
      p2 = pad[i + 1],
      p3 = pad[i + 2]
    const t0 = 0
    const t1 = t0 + dist(p0, p1)
    const t2 = t1 + dist(p1, p2)
    const t3 = t2 + dist(p2, p3)
    for (let j = 0; j < seg; j++) {
      const t = t1 + ((t2 - t1) * j) / seg
      const lerp = (af: number, ax: number, bf: number, bx: number, d: number) =>
        (af / d) * ax + (bf / d) * bx
      const a1x = lerp(t1 - t, p0.x, t - t0, p1.x, t1 - t0)
      const a1y = lerp(t1 - t, p0.y, t - t0, p1.y, t1 - t0)
      const a2x = lerp(t2 - t, p1.x, t - t1, p2.x, t2 - t1)
      const a2y = lerp(t2 - t, p1.y, t - t1, p2.y, t2 - t1)
      const a3x = lerp(t3 - t, p2.x, t - t2, p3.x, t3 - t2)
      const a3y = lerp(t3 - t, p2.y, t - t2, p3.y, t3 - t2)
      const b1x = lerp(t2 - t, a1x, t - t0, a2x, t2 - t0)
      const b1y = lerp(t2 - t, a1y, t - t0, a2y, t2 - t0)
      const b2x = lerp(t3 - t, a2x, t - t1, a3x, t3 - t1)
      const b2y = lerp(t3 - t, a2y, t - t1, a3y, t3 - t1)
      out.push({
        x: lerp(t2 - t, b1x, t - t1, b2x, t2 - t1),
        y: lerp(t2 - t, b1y, t - t1, b2y, t2 - t1),
      })
    }
  }
  out.push(pts[n - 1])
  return out
}

// Geometry in image (x,y) space, used by the route editor.
const projT = (p: Pt, a: Pt, b: Pt) => {
  const dx = b.x - a.x,
    dy = b.y - a.y
  return ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)
}
const distToSeg = (p: Pt, a: Pt, b: Pt) => {
  const t = Math.max(0, Math.min(1, projT(p, a, b)))
  return Math.hypot(p.x - (a.x + t * (b.x - a.x)), p.y - (a.y + t * (b.y - a.y)))
}

const viaIcon = L.divIcon({
  className: "",
  html: `<div class="size-3 rounded-full border-2 border-warning bg-base-100 shadow"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
})

const pin = (n: number, active: boolean, label?: string) =>
  L.divIcon({
    className: "",
    html: `<div class="flex items-center gap-1">
      <div class="grid shrink-0 place-items-center rounded-full font-bold shadow-md ring-2 ring-base-100 transition-all ${
        active
          ? "size-9 bg-secondary text-secondary-content text-sm"
          : "size-7 bg-primary text-primary-content text-xs"
      }">${n}</div>${
        label
          ? `<span class="whitespace-nowrap rounded bg-base-100/85 px-1.5 py-0.5 font-heading text-xs font-semibold leading-none text-base-content shadow-sm ring-1 ring-base-300">${label}</span>`
          : ""
      }</div>`,
    iconSize: active ? [36, 36] : [28, 28],
    iconAnchor: active ? [18, 18] : [14, 14],
  })

// Overview "navigator": a thumbnail of the whole map (always showing the full
// image) with a draggable focus rectangle marking the current view — the
// standard overview+detail pattern, via the leaflet-minimap plugin.
function Navigator() {
  const map = useMap()
  useEffect(() => {
    const layer = L.imageOverlay(MAP_URL, bounds)
    const W2 = 132
    // CRS.Simple: at zoom z, 1 image-unit = 2^z px, so the zoom that fits the
    // 4000px-wide image into the W2-wide thumbnail is log2(W2 / W).
    const fit = Math.log2(W2 / W)
    const mini = new MiniMapControl(layer, {
      position: "bottomleft",
      width: W2,
      height: 84,
      zoomLevelFixed: fit,
      centerFixed: bounds.getCenter(),
      toggleDisplay: true,
      aimingRectOptions: { color: "#6c2bd9", weight: 2, fillColor: "#6c2bd9", fillOpacity: 0.15 },
      mapOptions: { crs: L.CRS.Simple, zoomSnap: 0, minZoom: -10, maxZoom: 10 },
    })
    mini.addTo(map)
    return () => {
      mini.remove()
    }
  }, [map])
  return null
}

// Track the map's zoom so we can reveal labels only when zoomed in.
function ZoomWatch({ onZoom }: { onZoom: (z: number) => void }) {
  const map = useMapEvents({ zoomend: () => onZoom(map.getZoom()) })
  useEffect(() => {
    onZoom(map.getZoom())
  }, [map, onZoom])
  return null
}

// Min zoom = the zoom at which the image *covers* the container (inside=true),
// so it always fills the frame: on desktop (container matches the image aspect)
// that's the full map; on a portrait phone it fills the screen and you pan the
// wide map horizontally (which follows the east→west voyage). Can't zoom out
// past that. Recomputes on resize/orientation change.
function LockMinZoom() {
  const map = useMap()
  useEffect(() => {
    let focused = false
    const lock = () => {
      const z = map.getBoundsZoom(bounds, true)
      map.setMinZoom(z)
      const sz = map.getSize()
      if (!focused && sz.x > 0 && sz.y > 0) {
        // Open on Troy (stop 1) — the start of the voyage — not the map centre.
        map.setView(yx(STOPS[0].x, STOPS[0].y), z, { animate: false })
        focused = true
      } else if (map.getZoom() < z) {
        map.setZoom(z)
      }
    }
    lock()
    map.on("resize", lock)
    const settle = setTimeout(lock, 300)
    return () => {
      map.off("resize", lock)
      clearTimeout(settle)
    }
  }, [map])
  return null
}

// Flies the map to the active tour stop (or back to the whole map when idle).
function TourController({ idx }: { idx: number }) {
  const map = useMap()
  useEffect(() => {
    if (idx < 0) {
      map.flyToBounds(bounds, { duration: 0.8 })
      return
    }
    const s = STOPS[idx]
    map.flyTo(yx(s.x, s.y), TOUR_ZOOM, { duration: 1.1 })
  }, [idx, map])
  return null
}

type EntryInfo = {
  term: string
  pron: string
  def: string
  zhName: string
  zhPinyin: string
  zhDef: string
}

export default function JourneyMap({
  open,
  onClose,
  onSelect,
  lookup,
}: {
  open: boolean
  onClose: () => void
  onSelect: (term: string) => void
  lookup: (term: string) => EntryInfo | undefined
}) {
  // Calibration mode: open the map at #humaneyeball to drag the pins and
  // copy back the corrected coordinates. No effect on the normal experience.
  const editing =
    typeof window !== "undefined" && window.location.hash.toLowerCase().includes("eyeball")
  const [pos, setPos] = useState<Pt[]>(() => STOPS.map((s) => ({ x: s.x, y: s.y })))
  const [vias, setVias] = useState<Pt[][]>(() => LEG_VIAS.map((a) => a.map((p) => ({ ...p }))))

  // Flatten stops + their sea-routing vias, then smooth into a sailing curve.
  const routeLatLng = useMemo(() => {
    const flat: Pt[] = []
    pos.forEach((p, i) => {
      flat.push(p)
      if (i < pos.length - 1) vias[i].forEach((v) => flat.push(v))
    })
    return smooth(flat).map((p) => yx(p.x, p.y))
  }, [pos, vias])

  // Click the route line → drop a bend point into the nearest leg, in order.
  const addVia = (lat: number, lng: number) => {
    const p: Pt = { x: Math.round(lng), y: Math.round(H - lat) }
    let best = 0,
      bestD = Infinity
    for (let i = 0; i < pos.length - 1; i++) {
      const legPts = [pos[i], ...vias[i], pos[i + 1]]
      for (let k = 0; k < legPts.length - 1; k++) {
        const d = distToSeg(p, legPts[k], legPts[k + 1])
        if (d < bestD) {
          bestD = d
          best = i
        }
      }
    }
    const tP = projT(p, pos[best], pos[best + 1])
    const arr = vias[best]
    let idx = arr.length
    for (let j = 0; j < arr.length; j++)
      if (projT(arr[j], pos[best], pos[best + 1]) > tP) {
        idx = j
        break
      }
    setVias((prev) =>
      prev.map((a, i) => (i === best ? [...a.slice(0, idx), p, ...a.slice(idx)] : a)),
    )
  }

  const dump = useMemo(
    () =>
      JSON.stringify(
        {
          stops: STOPS.map((s, i) => ({ term: s.term, x: pos[i].x, y: pos[i].y })),
          legVias: vias.map((a) => a.map((v) => ({ x: v.x, y: v.y }))),
        },
        null,
        1,
      ),
    [pos, vias],
  )
  const [tour, setTour] = useState(-1) // -1 = not touring; else current stop index
  const [playing, setPlaying] = useState(false)
  const [zoom, setZoom] = useState<number | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const showLabels = zoom !== null && zoom >= LABEL_ZOOM

  // Auto-advance while playing; stop at the last stop.
  useEffect(() => {
    if (!playing || tour < 0) return
    timer.current = window.setTimeout(() => {
      setTour((i) => {
        if (i >= STOPS.length - 1) {
          setPlaying(false)
          return i
        }
        return i + 1
      })
    }, 3800)
    return () => window.clearTimeout(timer.current)
  }, [playing, tour])

  if (!open) return null

  const start = () => {
    setTour(0)
    setPlaying(true)
  }
  const end = () => {
    setPlaying(false)
    setTour(-1)
  }
  const go = (i: number) => {
    setPlaying(false)
    setTour(Math.max(0, Math.min(STOPS.length - 1, i)))
  }
  const cur = tour >= 0 ? STOPS[tour] : null

  return (
    <div className="modal modal-open" role="dialog" aria-label="The Journey of Odysseus">
      <div className="modal-box flex h-dvh max-h-dvh w-full max-w-none flex-col gap-2 rounded-none p-2 sm:h-auto sm:max-h-[94vh] sm:w-auto sm:max-w-[96vw] sm:gap-3 sm:rounded-box sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold tracking-wide sm:text-3xl">
            The Journey of Odysseus
          </h2>
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="relative w-full grow overflow-hidden rounded-box border border-base-300 sm:h-[80vh] sm:w-auto sm:grow-0 sm:aspect-[4000/2337] sm:max-w-[94vw] sm:self-center">
          <MapContainer
            crs={L.CRS.Simple}
            bounds={bounds}
            maxBounds={bounds}
            minZoom={-5}
            maxZoom={2}
            zoomSnap={0}
            zoomDelta={0.6}
            scrollWheelZoom
            wheelPxPerZoomLevel={90}
            attributionControl={false}
            className="h-full w-full bg-base-300"
          >
            <ImageOverlay url={MAP_URL} bounds={bounds} />
            <ZoomWatch onZoom={setZoom} />
            <LockMinZoom />
            {!editing && <Navigator />}
            {/* Casing: a pale outline under the route so it reads on any part of
                the busy antique map; the coloured dashes ride on top. */}
            <Polyline
              positions={routeLatLng}
              pathOptions={{ color: "#fff", weight: 6, opacity: 0.9, lineCap: "round" }}
            />
            <Polyline
              positions={routeLatLng}
              pathOptions={{ className: "journey-route", color: "#6c2bd9", weight: 3 }}
            />
            {/* Editing: fat invisible line that's easy to click to drop a bend. */}
            {editing && (
              <Polyline
                positions={routeLatLng}
                pathOptions={{ color: "#000", weight: 22, opacity: 0 }}
                eventHandlers={{ click: (e) => addVia(e.latlng.lat, e.latlng.lng) }}
              />
            )}
            {editing &&
              vias.map((arr, legIdx) =>
                arr.map((v, j) => (
                  <Marker
                    key={`via-${legIdx}-${j}`}
                    position={yx(v.x, v.y)}
                    icon={viaIcon}
                    draggable
                    eventHandlers={{
                      dragend: (e) => {
                        const ll = (e.target as L.Marker).getLatLng()
                        setVias((prev) =>
                          prev.map((a, i) =>
                            i === legIdx
                              ? a.map((vv, jj) =>
                                  jj === j ? { x: Math.round(ll.lng), y: Math.round(H - ll.lat) } : vv,
                                )
                              : a,
                          ),
                        )
                      },
                      dblclick: () =>
                        setVias((prev) =>
                          prev.map((a, i) => (i === legIdx ? a.filter((_, jj) => jj !== j) : a)),
                        ),
                    }}
                  />
                )),
              )}
            {STOPS.map((s, i) => {
              const info = lookup(s.term)
              return (
                <Marker
                  key={s.term}
                  position={yx(pos[i].x, pos[i].y)}
                  icon={pin(s.n, i === tour, i === tour || showLabels ? s.short : undefined)}
                  zIndexOffset={i === tour ? 1000 : 0}
                  draggable={editing}
                  eventHandlers={{
                    dragend: (e) => {
                      const ll = (e.target as L.Marker).getLatLng()
                      setPos((arr) =>
                        arr.map((p, j) =>
                          j === i ? { x: Math.round(ll.lng), y: Math.round(H - ll.lat) } : p,
                        ),
                      )
                    },
                  }}
                >
                  <Tooltip direction="top" offset={[0, -16]} opacity={1}>
                    <span className="font-heading text-sm font-semibold">
                      {s.n}. {s.label}
                    </span>
                    <span className="font-zh ml-1 opacity-70">{s.zh}</span>
                  </Tooltip>
                  {!editing && info && (
                    <Popup minWidth={220} maxWidth={260}>
                      <div className="space-y-1">
                        <h3 className="font-heading text-lg font-semibold leading-tight">{info.term}</h3>
                        <p className="text-xs italic text-primary">{info.pron}</p>
                        <p className="text-sm leading-snug">{info.def}</p>
                        <p className="font-zh text-sm leading-snug">
                          <span className="font-semibold">{info.zhName}</span>
                          <span className="px-1 text-primary">·</span>
                          {info.zhDef}
                        </p>
                        <button
                          type="button"
                          className="btn btn-primary btn-xs mt-1"
                          onClick={() => onSelect(s.term)}
                        >
                          View artworks →
                        </button>
                      </div>
                    </Popup>
                  )}
                </Marker>
              )
            })}
            <TourController idx={tour} />
          </MapContainer>

          {/* Calibration panel — drag pins, then copy these coordinates back. */}
          {editing && (
            <div className="absolute left-3 top-3 z-[1000] w-72 rounded-box border border-warning bg-base-100/95 p-3 shadow-xl backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wider text-warning">
                Calibration
              </p>
              <p className="mt-1 text-[0.7rem] leading-snug opacity-80">
                Drag pins to place stops. Click the route line to add a sea-bend;
                drag bends into the water; double-click a bend to remove it.
              </p>
              <textarea
                readOnly
                value={dump}
                onFocus={(e) => e.currentTarget.select()}
                className="textarea textarea-bordered mt-2 h-48 w-full font-mono text-[0.7rem] leading-snug"
              />
              <button
                type="button"
                className="btn btn-warning btn-sm mt-2 w-full"
                onClick={() => navigator.clipboard?.writeText(dump)}
              >
                Copy coordinates
              </button>
            </div>
          )}

          {/* Bottom-right: voyage control + the Fry-style numbered legend.
              Hidden during the tour (the tour card carries its own controls,
              and on mobile this would sit under the centered card). */}
          {tour < 0 && (
          <div className="absolute bottom-3 right-3 z-[1000] flex max-h-[calc(100%-1.5rem)] w-auto flex-col items-end gap-2 sm:w-56">
            <button type="button" className="btn btn-sm btn-primary sm:w-full" onClick={start}>
              ▶ Begin the voyage
            </button>
            {tour < 0 && (
              <ul className="hidden w-full overflow-auto rounded-box border border-base-300 bg-base-100/90 p-2 text-xs leading-tight shadow-lg backdrop-blur sm:block">
                {STOPS.map((s) => (
                  <li key={s.term}>
                    <button
                      type="button"
                      onClick={() => onSelect(s.term)}
                      className="flex w-full items-baseline gap-1.5 rounded px-1 py-[3px] text-left hover:bg-base-200"
                    >
                      <span className="font-bold text-primary">{s.n}.</span>
                      <span>{s.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          )}

          {/* Guided-tour control card */}
          {cur && (
            <div className="absolute bottom-3 left-1/2 z-[1000] w-[min(92%,30rem)] -translate-x-1/2 rounded-box border border-base-300 bg-base-100/95 p-4 shadow-xl backdrop-blur">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs uppercase tracking-wider text-primary">
                  Stop {cur.n} of {STOPS.length}
                </p>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-circle"
                  onClick={end}
                  aria-label="End tour"
                >
                  ✕
                </button>
              </div>
              <div className="mt-1 flex items-baseline justify-between gap-2">
                <h3 className="font-heading text-xl font-semibold">{cur.label}</h3>
                <span className="font-zh opacity-70">{cur.zh}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="btn btn-sm btn-square"
                    onClick={() => go(tour - 1)}
                    disabled={tour <= 0}
                    aria-label="Previous stop"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-square"
                    onClick={() => setPlaying((p) => !p)}
                    aria-label={playing ? "Pause" : "Play"}
                  >
                    {playing ? "❚❚" : "▶"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-square"
                    onClick={() => go(tour + 1)}
                    disabled={tour >= STOPS.length - 1}
                    aria-label="Next stop"
                  >
                    ›
                  </button>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    setPlaying(false)
                    onSelect(cur.term)
                  }}
                >
                  Open entry →
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs opacity-70">
          Abraham Ortelius, <em>Vlyssis Errores</em> (1597)
        </p>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  )
}
