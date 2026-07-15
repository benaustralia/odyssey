import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react"
import L from "leaflet"
import { MapContainer, ImageOverlay, Marker, Tooltip, Popup, Polyline, useMap, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
// @ts-expect-error - leaflet-minimap ships no type declarations
import MiniMapControl from "leaflet-minimap"
import "leaflet-minimap/dist/Control.MiniMap.min.css"
import CalibrationPanel from "./CalibrationPanel"
import type { JourneyConfig, Pt, TourTuning } from "./data/journeys/types"

// react-leaflet v5 never applies `pathOptions.className` to the SVG path
// (Leaflet only reads a top-level `className` in _initPath, and setStyle skips
// it). It happened to work in dev only because StrictMode's double-mount re-ran
// _initPath after the option was set. Apply the marching-ants class on `add`
// instead, so it survives the single-mount production build.
// Stable per-className handler identity (matches the old module-level-const
// pattern) so react-leaflet doesn't re-register the handler on every render.
const routeMarkers = new Map<string, { add: (e: L.LeafletEvent) => void }>()
const markRouteWithClass = (className: string) => {
  let m = routeMarkers.get(className)
  if (!m) {
    m = { add: (e: L.LeafletEvent) => (e.target as L.Path).getElement()?.classList.add(className) }
    routeMarkers.set(className, m)
  }
  return m
}

// Centripetal Catmull-Rom spline → smooth sailing curve through the control
// points. Centripetal (alpha=0.5) avoids the overshoot/loops that uniform
// Catmull-Rom produces when point spacing is very uneven. Returns dense points.
const ROUTE_SEG = 18 // points the spline emits per control-segment (input k -> output k*SEG)
const smooth = (pts: Pt[], seg = ROUTE_SEG): Pt[] => {
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

// A journey's vessel — rides the route during the tour, set on a white disc
// the size of an active pin: when it docks on a stop the disc cleanly covers
// the numbered label (the surfaced card names the destination), so the
// overlap reads as deliberate. Any `specialLegs` stage can swap in a
// different vessel (e.g. Odysseus's raft → swimmer once his raft is wrecked).
const vesselIcon = (svgUrl: string, alt: string) =>
  L.divIcon({
    className: "",
    html: `<div class="grid size-9 place-items-center rounded-full bg-white shadow-md ring-2 ring-base-300">
      <img src="${svgUrl}" alt="${alt}" class="h-6 w-6 object-contain" />
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18], // disc center rides the route and lands over the pin number
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
function Navigator({
  mapUrl,
  bounds,
  mapWidth,
}: {
  mapUrl: string
  bounds: L.LatLngBounds
  mapWidth: number
}) {
  const map = useMap()
  useEffect(() => {
    const layer = L.imageOverlay(mapUrl, bounds)
    const W2 = 132
    // CRS.Simple: at zoom z, 1 image-unit = 2^z px, so the zoom that fits the
    // image's width into the W2-wide thumbnail is log2(W2 / mapWidth).
    const fit = Math.log2(W2 / mapWidth)
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
  }, [map, mapUrl, bounds, mapWidth])
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
// so it always fills the frame regardless of the window's shape (the modal is
// edge-to-edge at every breakpoint, no aspect-ratio lock): a wide desktop
// window shows most of the map, a portrait phone fills the screen and you pan
// the wide map horizontally. Can't zoom out past that. Recomputes on resize/rotate.
function LockMinZoom({ bounds, initialView }: { bounds: L.LatLngBounds; initialView: L.LatLngTuple }) {
  const map = useMap()
  useEffect(() => {
    let focused = false
    const lock = () => {
      const z = map.getBoundsZoom(bounds, true)
      map.setMinZoom(z)
      const sz = map.getSize()
      if (!focused && sz.x > 0 && sz.y > 0) {
        // Open on the journey's first stop — the start of the voyage — not the map centre.
        map.setView(initialView, z, { animate: false })
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
  }, [map, bounds, initialView])
  return null
}

// Glide the camera along a list of latlngs at a fixed zoom (so the view follows
// the purple route instead of zooming out and back in). Speed is scaled to the
// on-screen length and clamped (via glideMsFn) so it's neither a crawl nor a lurch.
function panAlong(
  map: L.Map,
  latlngs: L.LatLngTuple[],
  zoom: number,
  raf: { current?: number },
  glideMsFn: (px: number) => number,
  onMove?: (ll: L.LatLng) => void,
  onDone?: () => void,
) {
  if (latlngs.length < 2) {
    const end = latlngs[latlngs.length - 1] ?? map.getCenter()
    map.setView(end, zoom, { animate: false })
    onMove?.(L.latLng(end))
    onDone?.()
    return
  }
  const pts = latlngs.map((ll) => map.project(L.latLng(ll), zoom))
  const cum = [0]
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]))
  const total = cum[cum.length - 1]
  const duration = glideMsFn(total)
  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
  let start = 0
  const step = (now: number) => {
    if (!start) start = now
    const t = Math.min(1, (now - start) / duration)
    const d = ease(t) * total
    let i = 1
    while (i < cum.length && cum[i] < d) i++
    const s0 = cum[i - 1]
    const s1 = cum[i]
    const f = s1 > s0 ? (d - s0) / (s1 - s0) : 0
    const p = pts[i - 1].add(pts[i].subtract(pts[i - 1]).multiplyBy(f))
    const ll = map.unproject(p, zoom)
    map.setView(ll, zoom, { animate: false })
    onMove?.(ll)
    if (t < 1) raf.current = requestAnimationFrame(step)
    else onDone?.()
  }
  raf.current = requestAnimationFrame(step)
}

// A special leg (e.g. Odysseus's raft wrecking partway to Scheria), resolved
// against this journey's stop indices and route-point positions. Computed
// once per render and consumed by TourController, legGlideMs, and the route-
// segment renderer below — nothing else re-derives "is this the special leg."
type ResolvedSpecialLeg = {
  fromIdx: number
  toIdx: number
  routeClassName?: string
  stages: { icon: L.DivIcon; wreckRouteIdx: number; pauseAfterMs?: number }[]
}

type Segment = { points: L.LatLngTuple[]; icon: L.DivIcon; pauseAfterMs?: number }

// Shared lookup so TourController, legGlideMs, and the route-segment renderer
// all agree on which stop-pair (in either travel direction) is a special leg.
const findSpecialLeg = (legs: ResolvedSpecialLeg[], a: number, b: number) =>
  legs.find((l) => (l.fromIdx === a && l.toIdx === b) || (l.fromIdx === b && l.toIdx === a))

// Drives the tour camera: glide along the route between adjacent stops, ease
// straight in for jumps (legend clicks / first stop), zoom out when idle.
function TourController({
  idx,
  route,
  stopIdx,
  resolvedSpecialLegs,
  shipIcon,
  tourZoom,
  jumpMs,
  bounds,
  glideMsFn,
}: {
  idx: number
  route: L.LatLngTuple[]
  stopIdx: number[]
  resolvedSpecialLegs: ResolvedSpecialLeg[]
  shipIcon: L.DivIcon
  tourZoom: number
  jumpMs: number
  bounds: L.LatLngBounds
  glideMsFn: (px: number) => number
}) {
  const map = useMap()
  const prev = useRef(-1)
  const raf = useRef<number | undefined>(undefined)
  const wreckTimer = useRef<number | undefined>(undefined)
  const ship = useRef<L.Marker | undefined>(undefined)

  // The ship rides the route during the tour; created once, hidden when idle.
  useEffect(() => {
    const m = L.marker(map.getCenter(), {
      icon: shipIcon,
      interactive: false,
      keyboard: false,
      zIndexOffset: 2000, // rides above the pins so the disc covers the docked number
      opacity: 0,
    }).addTo(map)
    ship.current = m
    return () => {
      m.remove()
      ship.current = undefined
    }
  }, [map, shipIcon])

  useEffect(() => {
    const cancel = () => {
      if (raf.current) cancelAnimationFrame(raf.current)
      if (wreckTimer.current) window.clearTimeout(wreckTimer.current)
    }
    const moveShip = (ll: L.LatLng) => {
      ship.current?.setLatLng(ll).setOpacity(1)
    }
    if (idx < 0) {
      // route/stopIdx get new array identities on every calibration drag
      // (pos/vias state changes), re-firing this effect while idx stays -1 —
      // guard so that doesn't re-trigger the zoom-to-fit on every drag.
      if (prev.current === -1) return
      cancel()
      ship.current?.setOpacity(0)
      map.flyToBounds(bounds, { duration: 0.8 })
      prev.current = -1
      return
    }
    const from = prev.current
    prev.current = idx
    const target = route[stopIdx[idx]]
    const leg = from >= 0 ? findSpecialLeg(resolvedSpecialLegs, from, idx) : undefined
    cancel()
    if (from < 0 || Math.abs(idx - from) !== 1) {
      ship.current?.setIcon(shipIcon)
      map.flyTo(L.latLng(target), tourZoom, { duration: jumpMs / 1000 })
      moveShip(L.latLng(target))
      return cancel
    }
    if (leg) {
      // Multi-stage vessel swap mid-leg (e.g. raft -> pause -> swimmer),
      // reversed automatically on rewind.
      const forward = from === leg.fromIdx
      const legStart = Math.min(stopIdx[leg.fromIdx], stopIdx[leg.toIdx])
      const boundaries = [legStart, ...leg.stages.map((s) => s.wreckRouteIdx)]
      const fwdSegs: Segment[] = leg.stages.map((s, i) => ({
        points: route.slice(boundaries[i], boundaries[i + 1] + 1),
        icon: s.icon,
        pauseAfterMs: s.pauseAfterMs,
      }))
      const n = fwdSegs.length
      const playSegs: Segment[] = forward
        ? fwdSegs
        : fwdSegs.map((_, j) => {
            const orig = fwdSegs[n - 1 - j]
            return {
              points: orig.points.slice().reverse(),
              icon: orig.icon,
              pauseAfterMs: j < n - 1 ? fwdSegs[n - 2 - j].pauseAfterMs : undefined,
            }
          })
      const playChain = (i: number) => {
        if (i >= playSegs.length) return
        const seg = playSegs[i]
        ship.current?.setIcon(seg.icon)
        panAlong(map, seg.points, tourZoom, raf, glideMsFn, moveShip, () => {
          if (seg.pauseAfterMs) {
            wreckTimer.current = window.setTimeout(() => playChain(i + 1), seg.pauseAfterMs)
          } else {
            playChain(i + 1)
          }
        })
      }
      playChain(0)
      return cancel
    }
    ship.current?.setIcon(shipIcon)
    const a = stopIdx[from]
    const b = stopIdx[idx]
    const path = a <= b ? route.slice(a, b + 1) : route.slice(b, a + 1).reverse()
    panAlong(map, path, tourZoom, raf, glideMsFn, moveShip)
    return cancel
  }, [idx, map, route, stopIdx, resolvedSpecialLegs, shipIcon, tourZoom, jumpMs, bounds, glideMsFn])
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

const DEFAULT_TUNING: Required<TourTuning> = {
  tourZoom: 1,
  labelZoom: -0.6,
  tourPps: 150,
  glideMin: 3500,
  glideMax: 11000,
  dwellMs: 3500,
  jumpMs: 900,
}

export default function JourneyMap({
  config,
  open,
  editing,
  onClose,
  onSelect,
  lookup,
}: {
  config: JourneyConfig
  open: boolean
  editing: boolean
  onClose: () => void
  onSelect: (term: string) => void
  lookup: (term: string) => EntryInfo | undefined
}) {
  const tuning = { ...DEFAULT_TUNING, ...config.tuning }
  const yx = (x: number, y: number): L.LatLngTuple => [config.mapHeight - y, x]
  const bounds = useMemo(
    () => L.latLngBounds([0, 0], [config.mapHeight, config.mapWidth]),
    [config.mapHeight, config.mapWidth],
  )
  const shipIcon = useMemo(
    () => vesselIcon(config.vessel.svgUrl, config.vessel.alt),
    [config.vessel],
  )
  // Memoized: this is LockMinZoom's `initialView` prop, which sits in that
  // component's effect dependency array — a fresh array literal every render
  // would re-fire the effect (and its per-run `focused` guard) on every
  // JourneyMap re-render, snapping the camera back to the first stop on every
  // tour/zoom/calibration-drag update instead of only on mount/resize.
  const initialView = useMemo(
    () => yx(config.stops[0].x, config.stops[0].y),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.stops, config.mapHeight],
  )
  // Glide speed is paced by on-screen pixels so a leg's speed is consistent,
  // clamped so it's neither a crawl nor a lurch (some legs are ~10x longer
  // on-screen than others). Memoized: it's threaded into TourController as a
  // prop that also sits in that component's effect dependency array, so a
  // fresh function identity every render would re-fire the tour-driving
  // effect on every unrelated re-render (e.g. a zoom change mid-tour).
  const glideMs = useCallback(
    (px: number) => Math.min(tuning.glideMax, Math.max(tuning.glideMin, (px / tuning.tourPps) * 1000)),
    [tuning.glideMax, tuning.glideMin, tuning.tourPps],
  )

  const [pos, setPos] = useState<Pt[]>(() => config.stops.map((s) => ({ x: s.x, y: s.y })))
  const [vias, setVias] = useState<Pt[][]>(() => config.legVias.map((a) => a.map((p) => ({ ...p }))))

  // Flatten stops + their sea-routing vias, then smooth into a sailing curve.
  const routeLatLng = useMemo(() => {
    const flat: Pt[] = []
    pos.forEach((p, i) => {
      flat.push(p)
      if (i < pos.length - 1) vias[i].forEach((v) => flat.push(v))
    })
    return smooth(flat).map((p) => yx(p.x, p.y))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, vias, config.mapHeight])

  // Index of each stop within routeLatLng (input point k lands at k*ROUTE_SEG),
  // so the tour can slice the curve for the leg it's traversing.
  const stopRouteIdx = useMemo(() => {
    const idxs: number[] = []
    let flat = 0
    pos.forEach((_, i) => {
      idxs.push(flat * ROUTE_SEG)
      flat += 1 + (i < pos.length - 1 ? vias[i].length : 0)
    })
    return idxs
  }, [pos, vias])

  // Vessel icons only depend on the journey's specialLeg config (svgUrl/alt),
  // never on stopRouteIdx — kept in its own memo so dragging a pin/via in
  // calibration mode (which recomputes stopRouteIdx on every drag) doesn't
  // reallocate an L.DivIcon per stage on every frame.
  const specialLegIcons = useMemo(
    () => (config.specialLegs ?? []).map((leg) => leg.stages.map((s) => vesselIcon(s.svgUrl, s.alt))),
    [config.specialLegs],
  )

  // Resolve this journey's specialLegs (if any) against its stop indices and
  // route positions — the one canonical derivation every consumer below reads
  // instead of re-deriving "is this leg special" independently.
  const resolvedSpecialLegs = useMemo<ResolvedSpecialLeg[]>(
    () =>
      (config.specialLegs ?? []).map((leg, li) => {
        const fromIdx = config.stops.findIndex((s) => s.term === leg.fromTerm)
        const toIdx = config.stops.findIndex((s) => s.term === leg.toTerm)
        const legStart = Math.min(stopRouteIdx[fromIdx], stopRouteIdx[toIdx])
        const legEnd = Math.max(stopRouteIdx[fromIdx], stopRouteIdx[toIdx])
        return {
          fromIdx,
          toIdx,
          routeClassName: leg.routeClassName,
          stages: leg.stages.map((stage, si) => ({
            icon: specialLegIcons[li][si],
            wreckRouteIdx: stage.uptoViaIndex < 0 ? legEnd : legStart + (stage.uptoViaIndex + 1) * ROUTE_SEG,
            pauseAfterMs: stage.pauseAfterMs,
          })),
        }
      }),
    [config.specialLegs, config.stops, stopRouteIdx, specialLegIcons],
  )
  // Split the route into styled segments: any specialLeg gets its own dash
  // style (e.g. Odysseus's drifting-raft leg), the rest keeps the normal one.
  // Degenerates to one segment covering the whole route when there are none.
  const routeSegments = useMemo(() => {
    const specials = resolvedSpecialLegs
      .map((l) => ({
        start: Math.min(stopRouteIdx[l.fromIdx], stopRouteIdx[l.toIdx]),
        end: Math.max(stopRouteIdx[l.fromIdx], stopRouteIdx[l.toIdx]),
        className: l.routeClassName ?? "journey-route",
      }))
      .sort((a, b) => a.start - b.start)
    const segs: { positions: L.LatLngTuple[]; className: string }[] = []
    let cursor = 0
    for (const sp of specials) {
      if (sp.start > cursor) segs.push({ positions: routeLatLng.slice(cursor, sp.start + 1), className: "journey-route" })
      segs.push({ positions: routeLatLng.slice(sp.start, sp.end + 1), className: sp.className })
      cursor = sp.end
    }
    if (cursor < routeLatLng.length - 1) segs.push({ positions: routeLatLng.slice(cursor), className: "journey-route" })
    return segs
  }, [resolvedSpecialLegs, routeLatLng, stopRouteIdx])

  // Click the route line → drop a bend point into the nearest leg, in order.
  const addVia = (lat: number, lng: number) => {
    const p: Pt = { x: Math.round(lng), y: Math.round(config.mapHeight - lat) }
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
          stops: config.stops.map((s, i) => ({ term: s.term, x: pos[i].x, y: pos[i].y })),
          legVias: vias.map((a) => a.map((v) => ({ x: v.x, y: v.y }))),
        },
        null,
        1,
      ),
    [config.stops, pos, vias],
  )
  const [tour, setTour] = useState(-1) // -1 = not touring; else current stop index
  const [focus, setFocus] = useState(-1) // legend pan target when not touring; -1 = whole map
  const [playing, setPlaying] = useState(false)
  const [zoom, setZoom] = useState<number | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const showLabels = zoom !== null && zoom >= tuning.labelZoom

  // On-screen length of the glide from one stop to an adjacent one → its
  // duration. Same px-at-tourZoom measure panAlong uses, so the timer and the
  // camera agree (a long leg gets a long glide without starving short stops).
  const pxBetween = (lo: number, hi: number) => {
    let px = 0
    for (let k = lo; k < hi; k++)
      px += Math.hypot(
        routeLatLng[k + 1][0] - routeLatLng[k][0],
        routeLatLng[k + 1][1] - routeLatLng[k][1],
      )
    return px
  }
  const legGlideMs = (from: number, to: number) => {
    const lo = Math.min(stopRouteIdx[from], stopRouteIdx[to])
    const hi = Math.max(stopRouteIdx[from], stopRouteIdx[to])
    const scale = Math.pow(2, tuning.tourZoom)
    const leg = findSpecialLeg(resolvedSpecialLegs, from, to)
    if (!leg) return glideMs(pxBetween(lo, hi) * scale)
    const boundaries = [lo, ...leg.stages.map((s) => s.wreckRouteIdx)]
    let total = 0
    for (let i = 0; i < leg.stages.length; i++) {
      total += glideMs(pxBetween(boundaries[i], boundaries[i + 1]) * scale)
      if (leg.stages[i].pauseAfterMs) total += leg.stages[i].pauseAfterMs!
    }
    return total
  }
  // How long the current stop holds the tour: glide-in + a fixed dwell.
  const enterMs = tour <= 0 ? tuning.jumpMs : legGlideMs(tour - 1, tour)
  const cycleMs = enterMs + tuning.dwellMs

  // Auto-advance while playing; stop at the last stop.
  useEffect(() => {
    if (!playing || tour < 0) return
    timer.current = window.setTimeout(() => {
      setTour((i) => {
        if (i >= config.stops.length - 1) {
          setPlaying(false)
          return i
        }
        return i + 1
      })
    }, cycleMs)
    return () => window.clearTimeout(timer.current)
  }, [playing, tour, cycleMs, config.stops.length])

  if (!open) return null

  const start = () => {
    setFocus(-1)
    setTour(0)
    setPlaying(true)
  }
  const end = () => {
    setPlaying(false)
    setTour(-1)
  }
  const go = (i: number) => {
    setPlaying(false)
    setTour(Math.max(0, Math.min(config.stops.length - 1, i)))
  }
  const cur = tour >= 0 ? config.stops[tour] : null

  return (
    <div className="modal modal-open" role="dialog" aria-label={config.title}>
      <div className="modal-box flex h-dvh max-h-dvh w-full max-w-none flex-col gap-2 rounded-none p-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold tracking-wide sm:text-3xl">
            {config.title}
          </h2>
          <button
            type="button"
            className="btn btn-circle btn-ghost btn-lg shrink-0 text-2xl sm:btn-sm sm:text-base"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="relative w-full grow">
          {/* The rounded-corner clip lives on this inner wrapper, not the
              outer relative container -- so it clips only the map/tiles, not
              the floating panels below (a shared corner-clip wrapper with
              those panels used to slice each panel's own corner where the
              container's curve cut across it). */}
          <div className="absolute inset-0 overflow-hidden rounded-box border border-base-300">
          <MapContainer
            crs={L.CRS.Simple}
            bounds={bounds}
            maxBounds={bounds}
            minZoom={-5}
            maxZoom={2}
            zoomSnap={0}
            zoomDelta={0.6}
            scrollWheelZoom
            wheelPxPerZoomLevel={15}
            attributionControl={false}
            className="h-full w-full bg-base-300"
          >
            <ImageOverlay url={config.mapUrl} bounds={bounds} />
            <ZoomWatch onZoom={setZoom} />
            <LockMinZoom bounds={bounds} initialView={initialView} />
            {!editing && <Navigator mapUrl={config.mapUrl} bounds={bounds} mapWidth={config.mapWidth} />}
            {/* Casing: a pale halo under the route so it reads on any part of the
                busy antique map. Same dash+animation as the purple line on top
                (per segment), so the marching-ants gaps stay transparent (not
                filled). Any specialLeg segment gets its own styling class. */}
            {routeSegments.map((seg, i) => (
              <Fragment key={`route-${i}`}>
                <Polyline
                  positions={seg.positions}
                  eventHandlers={markRouteWithClass(seg.className)}
                  pathOptions={{ color: "#fff", weight: 6, opacity: 0.85 }}
                />
                <Polyline
                  positions={seg.positions}
                  eventHandlers={markRouteWithClass(seg.className)}
                  pathOptions={{ color: "#6c2bd9", weight: 3 }}
                />
              </Fragment>
            ))}
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
                                  jj === j
                                    ? { x: Math.round(ll.lng), y: Math.round(config.mapHeight - ll.lat) }
                                    : vv,
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
            {config.stops.map((s, i) => {
              const info = lookup(s.term)
              return (
                <Marker
                  key={s.n}
                  position={yx(pos[i].x, pos[i].y)}
                  icon={pin(s.n, i === tour, i === tour || showLabels ? s.short : undefined)}
                  zIndexOffset={i === tour ? 1000 : 0}
                  draggable={editing}
                  eventHandlers={{
                    dragend: (e) => {
                      const ll = (e.target as L.Marker).getLatLng()
                      setPos((arr) =>
                        arr.map((p, j) =>
                          j === i ? { x: Math.round(ll.lng), y: Math.round(config.mapHeight - ll.lat) } : p,
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
            <TourController
              idx={tour >= 0 ? tour : focus}
              route={routeLatLng}
              stopIdx={stopRouteIdx}
              resolvedSpecialLegs={resolvedSpecialLegs}
              shipIcon={shipIcon}
              tourZoom={tuning.tourZoom}
              jumpMs={tuning.jumpMs}
              bounds={bounds}
              glideMsFn={glideMs}
            />
          </MapContainer>
          </div>

          {editing && (
            <CalibrationPanel
              hint="Drag pins to place stops. Click the route line to add a sea-bend; drag bends into the water; double-click a bend to remove it."
              dump={dump}
            />
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
                {config.stops.map((s, i) => (
                  <li key={s.n}>
                    <button
                      type="button"
                      onClick={() => setFocus((f) => (f === i ? -1 : i))}
                      className={`flex w-full items-baseline gap-1.5 rounded px-1 py-[3px] text-left hover:bg-base-200 ${
                        focus === i ? "bg-base-200" : ""
                      }`}
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
            <div className="absolute bottom-3 left-1/2 z-[1000] w-[min(92%,30rem)] -translate-x-1/2 overflow-hidden rounded-box border border-base-300 bg-base-100/95 p-4 shadow-xl backdrop-blur">
              {/* Minimal countdown: a bar that wears down until the next stop. */}
              {playing && (
                <span
                  key={cur.n}
                  className="absolute inset-x-0 top-0 block h-[3px] origin-left bg-primary"
                  style={{ animation: `tour-progress ${cycleMs}ms linear forwards` }}
                />
              )}
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs uppercase tracking-wider text-primary">
                  Stop {cur.n} of {config.stops.length}
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
                    disabled={tour >= config.stops.length - 1}
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
          {config.attribution.prefix}
          <em>{config.attribution.workTitle}</em>
          {config.attribution.suffix}
        </p>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  )
}
