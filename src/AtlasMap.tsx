import { useEffect, useMemo, useRef, useState } from "react"
import L from "leaflet"
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet"
import { Search, Crosshair } from "lucide-react"
import "leaflet/dist/leaflet.css"
// @ts-expect-error - leaflet-minimap ships no type declarations
import MiniMapControl from "leaflet-minimap"
import "leaflet-minimap/dist/Control.MiniMap.min.css"
import CalibrationPanel from "./CalibrationPanel"
import { PLATES, DEFAULT_PLATE_SLUG } from "@/data/plates"
import type { AtlasPlace as Place, PlateConfig } from "@/data/plates"

function CalibrationFooter({
  pins,
  setPins,
  dump,
  onFocusPlace,
  searchTerm,
  setSearchTerm,
}: {
  pins: Place[]
  setPins: (fn: (prev: Place[]) => Place[]) => void
  dump: string
  onFocusPlace?: (place: Place) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
}) {
  const [height, setHeight] = useState(128)
  const dragRef = useRef<{ startY: number; startHeight: number } | null>(null)
  const [editingCoords, setEditingCoords] = useState<Map<number, { x: string; y: string }>>(new Map())

  const filteredPins = useMemo(() => {
    if (!searchTerm.trim()) return pins
    const q = searchTerm.toLowerCase().trim()
    return pins.filter((p) => p.term.toLowerCase().includes(q))
  }, [pins, searchTerm])

  const handlePointerMove = (e: PointerEvent) => {
    if (!dragRef.current) return
    const delta = e.clientY - dragRef.current.startY
    // Dragging upward (negative delta) increases height
    const newHeight = Math.max(100, dragRef.current.startHeight - delta)
    setHeight(newHeight)
  }

  const handlePointerUp = () => {
    dragRef.current = null
  }

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [])

  return (
    <div
      className="flex flex-col gap-2 rounded-box border border-base-300 bg-base-200 p-3 text-sm"
      style={{ height: `${height}px` }}
    >
      {/* Resize bar at top */}
      <div
        className="h-1 w-full cursor-n-resize bg-base-300 hover:bg-primary -mx-3 -mt-3 mb-2 rounded-t"
        onPointerDown={(e) => {
          dragRef.current = { startY: e.clientY, startHeight: height }
        }}
        title="Drag upward to see more pins"
      />

      <div className="flex items-center justify-between gap-2 shrink-0">
        <span className="font-heading font-semibold">
          Calibration — Shift+click to add, edit coordinates below
        </span>
        <div className="flex gap-1">
          {pins.some((p) => p.term === "untitled") && (
            <button
              type="button"
              className="btn btn-xs btn-error"
              onClick={() => setPins((prev) => prev.filter((p) => p.term !== "untitled"))}
            >
              Remove untitled
            </button>
          )}
          <button
            type="button"
            className="btn btn-xs"
            onClick={() => navigator.clipboard.writeText(dump)}
          >
            Copy all
          </button>
        </div>
      </div>

      {/* Search filter */}
      <label className="input input-xs input-bordered flex items-center gap-2 shrink-0">
        <Search className="size-3 opacity-70" aria-hidden="true" />
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter pins..."
          className="grow"
        />
      </label>

      <div className="flex flex-col gap-1 overflow-y-auto min-h-0" style={{ scrollbarGutter: "stable" }}>
        {filteredPins.map((p) => {
          const i = pins.indexOf(p)
          const editing = editingCoords.get(i)
          const displayX = editing?.x ?? String(Math.round(p.x))
          const displayY = editing?.y ?? String(Math.round(p.y))
          return (
            <div key={i} className="flex items-center gap-2 shrink-0">
              <input
                className="input input-xs input-bordered flex-1"
                value={p.term}
                onChange={(e) =>
                  setPins((prev) =>
                    prev.map((q, j) => (j === i ? { ...q, term: e.target.value } : q)),
                  )
                }
                placeholder="name"
              />
              <input
                type="number"
                className="input input-xs input-bordered w-16"
                value={displayX}
                onChange={(e) => {
                  const newMap = new Map(editingCoords)
                  newMap.set(i, { ...editing || { x: "", y: "" }, x: e.target.value })
                  setEditingCoords(newMap)
                }}
                placeholder="x"
              />
              <input
                type="number"
                className="input input-xs input-bordered w-16"
                value={displayY}
                onChange={(e) => {
                  const newMap = new Map(editingCoords)
                  newMap.set(i, { ...editing || { x: "", y: "" }, y: e.target.value })
                  setEditingCoords(newMap)
                }}
                placeholder="y"
              />
              {editing ? (
                <button
                  type="button"
                  className="btn btn-xs btn-primary shrink-0"
                  onClick={() => {
                    const x = parseFloat(editing.x) || p.x
                    const y = parseFloat(editing.y) || p.y
                    setPins((prev) =>
                      prev.map((q, j) => (j === i ? { ...q, x, y } : q)),
                    )
                    editingCoords.delete(i)
                    setEditingCoords(new Map(editingCoords))
                  }}
                >
                  set
                </button>
              ) : null}
              {onFocusPlace && (
                <button
                  type="button"
                  className="btn btn-xs btn-ghost shrink-0"
                  onClick={() => onFocusPlace(p)}
                  title="Center and zoom on this place"
                >
                  <Crosshair className="size-3.5" />
                </button>
              )}
              <button
                type="button"
                className="btn btn-xs btn-ghost shrink-0"
                onClick={() => navigator.clipboard.writeText(JSON.stringify(p))}
                title="Copy this pin"
              >
                📋
              </button>
              <button
                type="button"
                className="btn btn-xs btn-ghost shrink-0"
                onClick={() => setPins((prev) => prev.filter((_, j) => j !== i))}
              >
                remove
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Each plate is an antique-map scan far past what Cloudinary's live c_crop
// transform API can handle in one request (the Red Sea plate is 13238x10802),
// so every plate is pre-sliced into a Google-Maps-style tile pyramid
// (`vips dzsave --layout google`, 256px tiles — scripts/make-plate.sh) and
// each tile uploaded to Cloudinary at a deterministic public_id
// (scripts/upload_tiles.py), so tile URLs need no lookup manifest — unlike
// art.json's `cld` field, which exists only because this account's
// dynamic-folder mode assigns *random* ids on a plain upload; passing an
// explicit `public_id` still pins the delivery path. Which plate this
// component shows, and where its pins sit, comes entirely from the
// `config: PlateConfig` prop (src/data/plates/) — same pattern as
// JourneyMap's JourneyConfig.
//
// Gotcha: dzsave's "google" layout addresses tiles on disk as
// {z}/{row}/{col}.jpg — the TRANSPOSE of Leaflet's {z}/{x}/{y} tile template
// (x=column, y=row). The URL below swaps y/x to compensate; get this backwards
// and the map renders as a scrambled, transposed puzzle (each tile intact,
// wrong tile in each cell) rather than a blank or missing-tiles failure.
const CLD = "https://res.cloudinary.com/dhvvz91bh/image/upload"
// No f_auto/q_auto here (unlike cldUrl's artwork delivery): each tile is
// already a small, pre-optimized JPEG baked by the vips dzsave pipeline
// (Q=82). f_auto/q_auto would make Cloudinary cache a separate variant per
// negotiated format (JPEG for curl, WebP for Chrome, etc.) across thousands
// of tiles -- every extra variant is its own cold-cache risk, and a warm-up
// pass only ever covers the formats it was tested with. One plain JPEG
// variant per tile avoids that fragmentation entirely.
const tileUrlTemplate = (cfg: PlateConfig) => `${CLD}/${cfg.tileBase}/{z}/{y}/{x}`
// z=0 is a single 256x256 JPEG canvas, but dzsave's "google" layout scales
// the plate down by exactly 2^maxZoom for the top pyramid level and leaves
// the rest of that 256x256 canvas as blank white padding -- it does NOT
// stretch/center the content to fill the tile. Content only occupies the
// top-left w/2^maxZoom x h/2^maxZoom px rectangle (confirmed on the Red Sea
// plate by sampling raw pixels: content ends at ~207x176, matching
// 13238/64=206.8 x 10802/64=168.8 plus a few px of border/JPEG-ringing). A
// couple of earlier attempts at cropping this assumed *symmetric* top/bottom
// letterboxing instead -- wrong; the padding is right+bottom only, content
// anchored top-left.
const thumbUrl = (cfg: PlateConfig) => {
  const z0Scale = 2 ** cfg.maxZoom
  const tw = Math.ceil(cfg.w / z0Scale) + 2
  const th = Math.ceil(cfg.h / z0Scale) + 2
  return `${CLD}/c_crop,x_0,y_0,w_${tw},h_${th}/${cfg.tileBase}/0/0/0`
}

// Enumerates every tile URL in the plate's pyramid, split into "overview"
// (low z, a couple hundred tiles / a few MB -- small enough to always warm
// immediately) and "detail" (the top two levels, the bulk of the pyramid's
// tens of MB).
function allTileUrls(cfg: PlateConfig) {
  const overview: string[] = []
  const detail: string[] = []
  for (let z = 0; z <= cfg.maxZoom; z++) {
    const factor = 2 ** (cfg.maxZoom - z)
    const cols = Math.ceil(Math.ceil(cfg.w / factor) / 256)
    const rows = Math.ceil(Math.ceil(cfg.h / factor) / 256)
    const bucket = z <= cfg.maxZoom - 2 ? overview : detail
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) bucket.push(`${CLD}/${cfg.tileBase}/${z}/${row}/${col}`)
    }
  }
  return { overview, detail }
}

// Fetches `urls` through a small worker pool so we don't fire 3000 requests
// at once (that would starve the actual visible-tile requests Leaflet is
// making). Best-effort: a failed/aborted prefetch just means that tile falls
// back to loading normally when panned to, same as before this existed.
async function prefetchTiles(urls: string[], concurrency: number, signal: AbortSignal) {
  let i = 0
  async function worker() {
    while (i < urls.length) {
      if (signal.aborted) return
      const url = urls[i++]
      try {
        await fetch(url, { signal, cache: "force-cache" })
      } catch {
        // aborted or offline -- fine, this is opportunistic
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))
}

// Warms the whole tile pyramid into the browser's HTTP cache (and, as a side
// effect, the CDN edge nearest this visitor) as soon as the map opens, so
// panning anywhere -- not just the initial viewport -- hits a warm cache
// instead of the ~1s cold Cloudinary fetch. Skipped on Data Saver / 2G,
// where an unsolicited tens-of-MB download would be actively hostile.
// Per-plate: the AtlasMap remount on plate switch (key={slug} in App) runs
// this effect's cleanup, aborting the old plate's prefetch.
function useTilePrefetch(enabled: boolean, cfg: PlateConfig) {
  useEffect(() => {
    if (!enabled) return
    const conn = (navigator as { connection?: { saveData?: boolean; effectiveType?: string } })
      .connection
    if (conn?.saveData || conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g") return
    const controller = new AbortController()
    const { overview, detail } = allTileUrls(cfg)
    ;(async () => {
      await prefetchTiles(overview, 8, controller.signal)
      await prefetchTiles(detail, 6, controller.signal)
    })()
    return () => controller.abort()
  }, [enabled, cfg])
}

// The visible dot stays 24px (size-6), but the divIcon itself is given a
// larger 40px hit box (padding around the dot) so a slightly imprecise
// mousedown still grabs the marker instead of falling through to the map's
// own click handler -- which, in eyeball mode, interprets a miss as "drop a
// new pin" (Calibrator) rather than "drag this one". cursor:grab signals it's
// draggable at a glance.
const pinIcon = L.divIcon({
  className: "",
  html: `<div class="grid size-10 cursor-grab place-items-center active:cursor-grabbing"><div class="size-6 rounded-full bg-primary text-primary-content shadow ring-2 ring-base-100"></div></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
})

// Gotcha (cost real debugging time): `map.unproject(point, zoom)` (an
// instance method) correctly divides by CRS.Simple's scale(zoom)=2^zoom and
// flips the y sign (its transformation is (x,y) -> (x,-y), so pixel-down
// maps to lat-up). But the *static* `L.CRS.Simple.unproject(point, zoom)` --
// tempting to reach for so this math can live outside a component, since it
// looks like the same function -- returns raw untransformed values instead.
// Bounds/marker positions built from the static call end up in full pixel
// units (0..13238) rather than the map's actual coordinate space, and
// fitBounds "solves" the resulting nonsense box by landing on a wrong zoom,
// which then makes the tile grid compute negative row/col indices (a wall of
// 404s like atlas/2/-2/1). So: only ever the instance method, off a live map.
// The zoom to unproject at is the plate's native level (cfg.maxZoom).
function unprojectPixel(map: L.Map, x: number, y: number, maxZoom: number) {
  return map.unproject(L.point(x, y), maxZoom)
}

// Overview "navigator": the z=0 tile is already a whole-map thumbnail (a
// single 256x256 tile, by construction of the pyramid), so it doubles as the
// minimap's image layer for free.
function Navigator({ bounds, cfg }: { bounds: L.LatLngBounds; cfg: PlateConfig }) {
  const map = useMap()
  useEffect(() => {
    const layer = L.imageOverlay(thumbUrl(cfg), bounds)
    const W2 = 132
    // `bounds` was built by unprojecting pixel coords 0..w at maxZoom, so
    // projecting back at maxZoom recovers exactly w px of width -- from
    // there the zoom that fits `bounds` into a W2-px-wide box is a plain
    // log2 scale, no dependency on the (differently-sized/differently
    // -proportioned) main map. The old formula derived this from the main
    // map's own getBoundsZoom()+container size, which fits `bounds` to the
    // main map's current aspect ratio, not the minimap's -- so the minimap
    // image came out smaller than its box, leaving a blank band on one side.
    const fit = cfg.maxZoom + Math.log2(W2 / cfg.w)
    const mini = new MiniMapControl(layer, {
      position: "bottomleft",
      width: W2,
      height: Math.round((W2 * cfg.h) / cfg.w),
      zoomLevelFixed: fit,
      // centerFixed keeps the overview pinned to the whole plate always --
      // without it, leaflet-minimap resyncs the mini map's center to the
      // MAIN map's current center on every move (still at the fixed zoom),
      // which pans the plate partly out of the small frame as soon as the
      // main map's center drifts from the plate's own centroid (any pan or
      // off-center zoom) -- exactly the blank-space bug this was meant to
      // fix in the first place, just reintroduced a different way.
      centerFixed: bounds.getCenter(),
      toggleDisplay: true,
      aimingRectOptions: { color: "#6c2bd9", weight: 2, fillColor: "#6c2bd9", fillOpacity: 0.15 },
      // leaflet-minimap also draws a "shadowRect" (used for its own built-in
      // drag-preview effect, unused here since dragging is off) directly on
      // top of the aiming rect in paint order. It's meant to be invisible
      // but still `interactive` by default in modern Leaflet (the plugin's
      // own `clickable:false` is a pre-1.0 Leaflet option name, silently
      // ignored now), so it swallowed every click before it reached the
      // purple rect underneath -- confirmed by Playwright's own drag tool,
      // which reported this exact element "intercepts pointer events".
      // Leaflet options are shallow-merged, not deep -- passing just
      // `{interactive:false}` here replaced the plugin's whole default
      // object instead of adding to it, so it lost `opacity:0`/
      // `fillOpacity:0` too and fell back to Leaflet's own default *visible
      // blue* path style. Keep the plugin's original invisibility options
      // alongside interactive:false.
      shadowRectOptions: { color: "#000000", weight: 1, opacity: 0, fillOpacity: 0, interactive: false },
      mapOptions: { crs: L.CRS.Simple, zoomSnap: 0, minZoom: -10, maxZoom: 10 },
    })
    mini.addTo(map)

    // centerFixed above hardcodes the mini map's own `dragging: false`
    // (leaflet-minimap ties the two together), so the built-in "drag the
    // mini map to pan the main map" interaction is off -- by design, since
    // that would drag the static whole-plate thumbnail itself off-center
    // (see above). Instead, make just the purple aiming rectangle
    // draggable: drag deltas are read in the mini map's own (fixed-zoom)
    // coordinate space via containerPointToLatLng, then replayed onto the
    // main map's center -- CRS.Simple lat/lng are plain linear x/y here, so
    // a delta computed in one map's space applies directly to the other's
    // center with no extra scaling.
    const miniMap = mini._miniMap as L.Map
    const rect = mini._aimingRect as L.Rectangle
    let dragStartPt: L.Point | null = null
    let mainStartCenter: L.LatLng | null = null

    const onRectDown = (e: L.LeafletMouseEvent) => {
      dragStartPt = miniMap.latLngToContainerPoint(e.latlng)
      mainStartCenter = map.getCenter()
      L.DomEvent.stopPropagation(e.originalEvent)
      L.DomEvent.preventDefault(e.originalEvent)
    }
    const onWindowMove = (e: MouseEvent) => {
      if (!dragStartPt || !mainStartCenter) return
      const miniRect = miniMap.getContainer().getBoundingClientRect()
      const curPt = L.point(e.clientX - miniRect.left, e.clientY - miniRect.top)
      const startLatLng = miniMap.containerPointToLatLng(dragStartPt)
      const curLatLng = miniMap.containerPointToLatLng(curPt)
      map.setView(
        L.latLng(
          mainStartCenter.lat + (curLatLng.lat - startLatLng.lat),
          mainStartCenter.lng + (curLatLng.lng - startLatLng.lng),
        ),
        map.getZoom(),
        { animate: false },
      )
    }
    const onWindowUp = () => {
      dragStartPt = null
      mainStartCenter = null
    }
    rect.on("mousedown", onRectDown)
    rect.getElement()?.classList.add("cursor-grab", "active:cursor-grabbing")
    window.addEventListener("mousemove", onWindowMove)
    window.addEventListener("mouseup", onWindowUp)

    return () => {
      rect.off("mousedown", onRectDown)
      window.removeEventListener("mousemove", onWindowMove)
      window.removeEventListener("mouseup", onWindowUp)
      mini.remove()
    }
  }, [map, bounds, cfg])
  return null
}

// react-leaflet's initial `bounds`-prop fit runs at mount time, which in a
// modal can be before the container has taken on its real CSS size (still
// 0x0) -- it then fits to a bogus aspect ratio and every subsequent tile
// request is offset. A one-shot timeout isn't reliable here (the modal's CSS
// layout may still not have settled), so watch the container with a
// ResizeObserver and fit as soon as its size becomes real. Also the one place
// bounds gets computed, via the live map's unproject -- see unprojectPixel's
// comment for why that must be an instance call.
// Gotcha: fit only ONCE (guarded by `fitted`), not on every observed resize.
// Leaflet's own zoom animation causes micro-reflows that the observer also
// sees; re-running fitBounds on those snapped the view straight back to
// "fit all" on every scroll-zoom tick, making scroll-to-zoom appear broken.
// Same one-shot idea as JourneyMap's LockMinZoom (its `focused` flag).
// Gotcha #2 (caught on an actual iPhone SE simulator, but the same fix now
// applies at every screen size): a plain fitBounds "fits inside" the
// container. The map's container is edge-to-edge at all breakpoints (no
// aspect-ratio lock -- that used to shrink the desktop card to the image's
// aspect ratio, wasting most of a wide viewport, so it was dropped), and its
// shape is whatever the window happens to be -- rarely a given plate's own
// aspect ratio. Fitting "inside" left big empty grey bands.
// JourneyMap solves this with `getBoundsZoom(bounds, true)` ("cover", not
// "contain") as the MIN zoom, so the map always fills the frame and you pan
// to see more -- same fix here.
function FitWhenReady({ cfg, onBounds }: { cfg: PlateConfig; onBounds: (b: L.LatLngBounds) => void }) {
  const map = useMap()
  useEffect(() => {
    let fitted = false
    const el = map.getContainer()
    const ro = new ResizeObserver(() => {
      if (fitted) return
      const sz = map.getSize()
      if (sz.x <= 0 || sz.y <= 0) return
      fitted = true
      const b = L.latLngBounds(
        unprojectPixel(map, 0, cfg.h, cfg.maxZoom),
        unprojectPixel(map, cfg.w, 0, cfg.maxZoom),
      )
      map.invalidateSize()
      map.setMaxBounds(b)
      const z = map.getBoundsZoom(b, true)
      map.setMinZoom(z)
      map.setView(b.getCenter(), z, { animate: false })
      onBounds(b)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [map, onBounds, cfg])
  return null
}

// Calibration mode: open at #atlas/<slug>-eyeball (#atlas-eyeball for the
// default plate), Shift+click the map to drop a pin, name it below, then
// "Copy coordinates" to paste the result back into that plate's `places` in
// src/data/plates/<slug>.ts. map.project() is the inverse of unproject() —
// turns the click's LatLng back into raw top-down image pixel coords,
// matching the places' x/y convention.
function Calibrator({ maxZoom, onAdd }: { maxZoom: number; onAdd: (p: Place) => void }) {
  const map = useMapEvents({
    click: (e: L.LeafletMouseEvent) => {
      if (!e.originalEvent.shiftKey) return
      const pt = map.project(e.latlng, maxZoom)
      onAdd({ term: "untitled", x: pt.x, y: pt.y })
    },
  })
  return null
}

// Handles focusing (centering and zooming) the map on a specific place.
// Decoupled from Pins so it can be triggered independently from the footer.
function PlaceFocuser({
  focusPlace,
  maxZoom,
  onFocus,
}: {
  focusPlace: Place | null
  maxZoom: number
  onFocus: (place: Place) => void
}) {
  const map = useMap()
  useEffect(() => {
    if (!focusPlace) return
    // Zoom in on the place at a reasonable level (z=3 for good detail)
    const latlng = unprojectPixel(map, focusPlace.x, focusPlace.y, maxZoom)
    map.setView(latlng, 3, { animate: true })
    onFocus(focusPlace)
  }, [focusPlace, map, maxZoom, onFocus])
  return null
}

// Markers are given in raw image pixel coords (matching places/Calibrator),
// so placing them needs the same live-map unproject as the bounds fit. In
// eyeball mode, pins are also draggable -- dragend converts the marker's
// dropped LatLng back to pixel coords via map.project(), the same inverse
// used by Calibrator for new pins (same pattern as JourneyMap's STOPS/vias
// draggable markers).
//
// Use Leaflet's NATIVE marker drag (`draggable` + dragend), nothing custom.
// A hand-rolled replacement was tried and reverted (6 commits); the traps,
// for the record:
// - Leaflet markers fire NO 'pointerdown'/'pointermove' events: Leaflet
//   translates DOM pointer events into its own 'mousedown'/'mousemove'
//   before dispatch, so eventHandlers={{ pointerdown }} attaches cleanly but
//   never fires. @types/leaflet rejecting those event names was the type
//   system being RIGHT -- casting to `any` just hid the dead code.
// - "Shift+drag the pin" can't work either: Shift+drag is Leaflet's builtin
//   BoxZoom gesture, bound as a raw DOM listener on the container, so it
//   engages even when the mousedown lands on a marker (rubber-band box over
//   the map, then a violent fitBounds zoom on release). L.Draggable also
//   deliberately ignores shift-mousedowns, so shift can never mean "drag".
// - A plain drag on a NON-draggable marker bubbles to the container and
//   pans the whole map; native MarkerDrag claims the gesture first (the
//   L.Draggable._dragging static lock) so the map holds still while a pin
//   is dragged.
// Native drag listens for both mouse and touch starts, so the same code
// path covers iOS finger-drags -- the "Leaflet drag is mouse-only" premise
// that motivated the removed rewrite was wrong.
function Pins({
  pins,
  editing,
  maxZoom,
  onSelect,
  onMove,
  onClickPin,
  lookup,
}: {
  pins: Place[]
  editing: boolean
  maxZoom: number
  onSelect: (term: string) => void
  onMove: (index: number, p: { x: number; y: number }) => void
  onClickPin?: (index: number) => void
  lookup: (term: string) => unknown
}) {
  const map = useMap()
  return (
    <>
      {pins.map((p, i) => (
        <Marker
          key={`${p.term}-${i}`}
          position={unprojectPixel(map, p.x, p.y, maxZoom)}
          icon={pinIcon}
          draggable={editing}
          eventHandlers={{
            click: (e) => {
              L.DomEvent.stopPropagation(e.originalEvent)
              onClickPin?.(i)
            },
            dragend: (e) => {
              const pt = map.project((e.target as L.Marker).getLatLng(), maxZoom)
              onMove(i, { x: pt.x, y: pt.y })
            },
          }}
        >
          <Popup minWidth={160}>
            <div className="flex flex-col gap-2">
              <span className="font-heading text-base font-semibold">{p.label ?? p.term}</span>
              {lookup(p.term) ? (
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => onSelect(p.term)}
                >
                  View artworks
                </button>
              ) : null}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  )
}

export default function AtlasMap({
  config,
  open,
  editing,
  onClose,
  onSelect,
  lookup,
}: {
  config: PlateConfig
  open: boolean
  editing: boolean
  onClose: () => void
  onSelect: (term: string) => void
  lookup: (term: string) => { zhName?: string } | undefined
}) {
  const [pins, setPins] = useState<Place[]>(config.places)
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null)
  const [focusPlace, setFocusPlace] = useState<Place | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // The dump keeps label/noGloss alongside term/x/y so a Copy-all round-trip
  // back into src/data/plates/<slug>.ts loses nothing.
  const dump = useMemo(
    () =>
      JSON.stringify(
        pins.map((p) => ({ ...p, x: Math.round(p.x), y: Math.round(p.y) })),
        null,
        1,
      ),
    [pins],
  )

  useTilePrefetch(open && !editing, config)

  // Plate switcher: navigating by hash (not local state) keeps App's
  // atlasRoute the single source of truth and remounts this component with a
  // fresh key per plate (clean pin state, aborted prefetch, one-shot fit).
  const switchPlate = (slug: string) => {
    const suffix = editing ? "-eyeball" : ""
    window.location.hash = slug === DEFAULT_PLATE_SLUG ? `atlas${suffix}` : `atlas/${slug}${suffix}`
  }

  if (!open) return null

  return (
    <div className="modal modal-open" role="dialog" aria-label="Atlas of the Odyssey">
      <div className="modal-box flex h-dvh max-h-dvh w-full max-w-none flex-col gap-2 rounded-none p-2 overflow-hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <h2 className="font-display text-2xl font-semibold tracking-wide sm:text-3xl">
              Atlas
            </h2>
            <select
              className="select select-bordered select-sm min-w-0"
              aria-label="Choose a plate"
              value={config.slug}
              onChange={(e) => switchPlate(e.target.value)}
            >
              {Object.values(PLATES).map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
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
              the floating calibration panel below (a shared corner-clip
              wrapper with the panel used to slice the panel's own top-left
              corner where the container's curve cut across it). */}
          <div className="absolute inset-0 overflow-hidden rounded-box border border-base-300">
            <MapContainer
              crs={L.CRS.Simple}
              minZoom={0}
              maxZoom={config.maxZoom}
              zoomSnap={0}
              zoomDelta={0.6}
              scrollWheelZoom
              wheelPxPerZoomLevel={15}
              // FitWhenReady below calls setMaxBounds once the plate's real
              // bounds are known, but Leaflet's default maxBoundsViscosity
              // is 0 -- "allow dragging past the bounds, snap back on
              // release" -- which is what let the drag reveal empty grey
              // past the plate edge. 1 makes the bounds a hard stop instead.
              maxBoundsViscosity={1}
              attributionControl={false}
              className="h-full w-full bg-base-300"
            >
              <TileLayer
                url={tileUrlTemplate(config)}
                tileSize={256}
                noWrap
                bounds={bounds ?? undefined}
                minZoom={0}
                maxZoom={config.maxZoom}
                keepBuffer={6}
                updateWhenIdle={false}
              />
              <FitWhenReady cfg={config} onBounds={setBounds} />
              {bounds && !editing && <Navigator bounds={bounds} cfg={config} />}
              {editing && (
                <Calibrator maxZoom={config.maxZoom} onAdd={(p) => setPins((prev) => [...prev, p])} />
              )}
              <PlaceFocuser
                focusPlace={focusPlace}
                maxZoom={config.maxZoom}
                onFocus={() => setFocusPlace(null)}
              />
              <Pins
                pins={pins}
                editing={editing}
                maxZoom={config.maxZoom}
                onSelect={onSelect}
                onMove={(i, p) =>
                  setPins((prev) => prev.map((q, j) => (j === i ? { ...q, ...p } : q)))
                }
                // Float the clicked pin to the top of the calibration footer
                // (and clear its filter) -- EYEBALL MODE ONLY. The reorder
                // changes every earlier marker's positional key, so React
                // remounts the clicked marker, and Leaflet closes a popup
                // when its marker is removed -- with this wired in view mode
                // too, every popup died ~200ms after opening and "View
                // artworks" was unreachable from atlas pins.
                onClickPin={
                  editing
                    ? (i) => {
                        setSearchTerm("")
                        setPins((prev) => {
                          if (i === 0) return prev // Already at top
                          const p = prev[i]
                          return [p, ...prev.slice(0, i), ...prev.slice(i + 1)]
                        })
                      }
                    : undefined
                }
                lookup={lookup}
              />
            </MapContainer>
          </div>

          {editing && (
            <CalibrationPanel
              hint={`Drag pins to reposition. Shift+click the map to drop a new one. Paste the JSON back into src/data/plates/${config.slug}.ts.`}
              dump={dump}
            />
          )}
        </div>

        {editing && (
          <CalibrationFooter
            pins={pins}
            setPins={setPins}
            dump={dump}
            onFocusPlace={(p) => setFocusPlace(p)}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )}
      </div>
    </div>
  )
}
