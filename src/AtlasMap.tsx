import { useEffect, useMemo, useState } from "react"
import L from "leaflet"
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
// @ts-expect-error - leaflet-minimap ships no type declarations
import MiniMapControl from "leaflet-minimap"
import "leaflet-minimap/dist/Control.MiniMap.min.css"
import CalibrationPanel from "./CalibrationPanel"

// Base map: Abraham Ortelius, "Erythraei Sive Rubri Maris Periplus" (1597) —
// the FULL Red Sea plate (Egypt, Arabia, Persia, India, East Africa), not just
// the "Vlyssis Errores" Aegean inset JourneyMap.tsx uses. Native scan is
// 13238x10802px — far past what Cloudinary's live c_crop transform API can
// handle in one request, so it's pre-sliced into a Google-Maps-style tile
// pyramid (`vips dzsave --layout google`, 7 zoom levels, 256px tiles) and each
// tile uploaded to Cloudinary at a deterministic public_id, so tile URLs need
// no lookup manifest — unlike art.json's `cld` field, which exists only
// because this account's dynamic-folder mode assigns *random* ids on a plain
// upload; passing an explicit `public_id` still pins the delivery path.
//
// Gotcha: dzsave's "google" layout addresses tiles on disk as
// {z}/{row}/{col}.jpg — the TRANSPOSE of Leaflet's {z}/{x}/{y} tile template
// (x=column, y=row). The URL below swaps y/x to compensate; get this backwards
// and the map renders as a scrambled, transposed puzzle (each tile intact,
// wrong tile in each cell) rather than a blank or missing-tiles failure.
const W = 13238
const H = 10802
const MAX_ZOOM = 6
const CLD = "https://res.cloudinary.com/dhvvz91bh/image/upload"
// No f_auto/q_auto here (unlike cldUrl's artwork delivery): each tile is
// already a small, pre-optimized JPEG baked by the vips dzsave pipeline
// (Q=82). f_auto/q_auto would make Cloudinary cache a separate variant per
// negotiated format (JPEG for curl, WebP for Chrome, etc.) across all 3010
// tiles -- every extra variant is its own cold-cache risk, and a warm-up
// pass only ever covers the formats it was tested with. One plain JPEG
// variant per tile avoids that fragmentation entirely.
const TILE_URL = `${CLD}/atlas/{z}/{y}/{x}`
// z=0 is a single 256x256 JPEG canvas, but dzsave's "google" layout scales
// the plate down by exactly 2^MAX_ZOOM for the top pyramid level and leaves
// the rest of that 256x256 canvas as blank white padding -- it does NOT
// stretch/center the content to fill the tile. Content only occupies the
// top-left W/2^MAX_ZOOM x H/2^MAX_ZOOM px rectangle (confirmed by sampling
// raw pixels: content ends at ~207x176, matching 13238/64=206.8x10802/64=
// 168.8 plus a few px of border/JPEG-ringing). A couple of earlier attempts
// at cropping this assumed *symmetric* top/bottom letterboxing instead --
// wrong; the padding is right+bottom only, content anchored top-left.
const Z0_SCALE = 2 ** MAX_ZOOM
const THUMB_W = Math.ceil(W / Z0_SCALE) + 2
const THUMB_H = Math.ceil(H / Z0_SCALE) + 2
const THUMB_URL = `${CLD}/c_crop,x_0,y_0,w_${THUMB_W},h_${THUMB_H}/atlas/0/0/0`

// Enumerates every tile URL in the pyramid, split into "overview" (z 0-4,
// ~202 tiles, a couple MB -- small enough to always warm immediately) and
// "detail" (z 5-6, ~2808 tiles, the bulk of the ~43MB pyramid).
function allTileUrls() {
  const overview: string[] = []
  const detail: string[] = []
  for (let z = 0; z <= MAX_ZOOM; z++) {
    const factor = 2 ** (MAX_ZOOM - z)
    const cols = Math.ceil(Math.ceil(W / factor) / 256)
    const rows = Math.ceil(Math.ceil(H / factor) / 256)
    const bucket = z <= 4 ? overview : detail
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) bucket.push(`${CLD}/atlas/${z}/${row}/${col}`)
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
// where an unsolicited ~43MB download would be actively hostile.
function useTilePrefetch(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    const conn = (navigator as { connection?: { saveData?: boolean; effectiveType?: string } })
      .connection
    if (conn?.saveData || conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g") return
    const controller = new AbortController()
    const { overview, detail } = allTileUrls()
    ;(async () => {
      await prefetchTiles(overview, 8, controller.signal)
      await prefetchTiles(detail, 6, controller.signal)
    })()
    return () => controller.abort()
  }, [enabled])
}

type Place = { term: string; x: number; y: number }

// Audited (via close inspection of the full-res plate, cross-referenced
// against the 84-place glossary) which of the "other places" named in the
// CLAUDE.md TODO -- Egypt, Phoenicia, Sidon, Red Sea/Arabia, Ethiopia/E.
// Africa -- actually fall within this plate's printed frame:
// - Egypt: yes, clearly labelled "AEGYPTVS" with Alexandria/Coptos/Diospolis.
// - Ethiopia: yes, but only in the small "Annonis Periplus" inset (Hanno's
//   voyage along the Atlantic coast, top-left), labelled "AETHIOPES AXENI" --
//   not the main plate body. Placed with that in mind.
// - Phoenicia / Sidon: NO -- the frame's top edge cuts off right at
//   "Hierusalem"; the Mediterranean coast further north (where Phoenicia's
//   cities sit) isn't drawn at all, not merely off in a margin.
// - "Red Sea" / "Arabia": neither exists as its own glossary term (checked
//   glossary.json), so there's nothing to pin for that TODO item specifically.
// - Pharos: yes -- its own glossary entry (the island off Alexandria near the
//   Nile mouth, where Menelaus is becalmed and wrestles Proteus in Book 4),
//   distinct from the general "Egypt" entry. Pinned at the coast by
//   "Alexandria" on this plate.
// Every other one of the 84 glossary places is Aegean/mainland-Greek and
// already covered by JourneyMap's Vlyssis Errores inset -- this plate mostly
// functions as a "wider crop" backdrop, not a second pin-map for the same set
// of places.
const PLACES: Place[] = [
  { term: "Egypt", x: 1628, y: 5353 },
  { term: "Ethiopia", x: 2821, y: 2305 },
  { term: "Pharos", x: 2301, y: 3394 },
]

// The visible dot stays 24px (size-6), but the divIcon itself is given a
// larger 40px hit box (padding around the dot) so a slightly imprecise
// mousedown still grabs the marker instead of falling through to the map's
// own click handler -- which, in #atlas-eyeball, interprets a miss as "drop a
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
function unprojectPixel(map: L.Map, x: number, y: number) {
  return map.unproject(L.point(x, y), MAX_ZOOM)
}

// Overview "navigator": the z=0 tile is already a whole-map thumbnail (a
// single 256x256 tile, by construction of the pyramid), so it doubles as the
// minimap's image layer for free.
function Navigator({ bounds }: { bounds: L.LatLngBounds }) {
  const map = useMap()
  useEffect(() => {
    const layer = L.imageOverlay(THUMB_URL, bounds)
    const W2 = 132
    // `bounds` was built by unprojecting pixel coords 0..W at MAX_ZOOM, so
    // projecting back at MAX_ZOOM recovers exactly W px of width -- from
    // there the zoom that fits `bounds` into a W2-px-wide box is a plain
    // log2 scale, no dependency on the (differently-sized/differently
    // -proportioned) main map. The old formula derived this from the main
    // map's own getBoundsZoom()+container size, which fits `bounds` to the
    // main map's current aspect ratio, not the minimap's -- so the minimap
    // image came out smaller than its box, leaving a blank band on one side.
    const fit = MAX_ZOOM + Math.log2(W2 / W)
    const mini = new MiniMapControl(layer, {
      position: "bottomleft",
      width: W2,
      height: Math.round((W2 * H) / W),
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
  }, [map, bounds])
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
// shape is whatever the window happens to be -- rarely this landscape
// plate's own aspect ratio. Fitting "inside" left big empty grey bands.
// JourneyMap solves this with `getBoundsZoom(bounds, true)` ("cover", not
// "contain") as the MIN zoom, so the map always fills the frame and you pan
// to see more -- same fix here.
function FitWhenReady({ onBounds }: { onBounds: (b: L.LatLngBounds) => void }) {
  const map = useMap()
  useEffect(() => {
    let fitted = false
    const el = map.getContainer()
    const ro = new ResizeObserver(() => {
      if (fitted) return
      const sz = map.getSize()
      if (sz.x <= 0 || sz.y <= 0) return
      fitted = true
      const b = L.latLngBounds(unprojectPixel(map, 0, H), unprojectPixel(map, W, 0))
      map.invalidateSize()
      map.setMaxBounds(b)
      const z = map.getBoundsZoom(b, true)
      map.setMinZoom(z)
      map.setView(b.getCenter(), z, { animate: false })
      onBounds(b)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [map, onBounds])
  return null
}

// Calibration mode: open at #atlas-eyeball, click the map to drop a pin, name
// it below, then "Copy coordinates" to paste the result back into PLACES.
// map.project() is the inverse of unproject() — turns the click's LatLng back
// into raw top-down image pixel coords, matching PLACES' x/y convention.
function Calibrator({ onAdd }: { onAdd: (p: Place) => void }) {
  const map = useMapEvents({
    click: (e) => {
      const pt = map.project(e.latlng, MAX_ZOOM)
      onAdd({ term: "untitled", x: pt.x, y: pt.y })
    },
  })
  return null
}

// Markers are given in raw image pixel coords (matching PLACES/Calibrator),
// so placing them needs the same live-map unproject as the bounds fit. In
// #atlas-eyeball, pins are also draggable -- dragend converts the marker's
// dropped LatLng back to pixel coords via map.project(), the same inverse
// used by Calibrator for new pins (same pattern as JourneyMap's STOPS/vias
// draggable markers).
function Pins({
  pins,
  editing,
  onSelect,
  onMove,
  lookup,
}: {
  pins: Place[]
  editing: boolean
  onSelect: (term: string) => void
  onMove: (index: number, p: { x: number; y: number }) => void
  lookup: (term: string) => unknown
}) {
  const map = useMap()
  return (
    <>
      {pins.map((p, i) => (
        <Marker
          key={`${p.term}-${i}`}
          position={unprojectPixel(map, p.x, p.y)}
          icon={pinIcon}
          draggable={editing}
          eventHandlers={{
            dragend: (e) => {
              const pt = map.project((e.target as L.Marker).getLatLng(), MAX_ZOOM)
              onMove(i, { x: pt.x, y: pt.y })
            },
          }}
        >
          <Popup minWidth={160}>
            <div className="flex flex-col gap-2">
              <span className="font-heading text-base font-semibold">{p.term}</span>
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
  open,
  onClose,
  onSelect,
  lookup,
}: {
  open: boolean
  onClose: () => void
  onSelect: (term: string) => void
  lookup: (term: string) => { zhName?: string } | undefined
}) {
  const editing =
    typeof window !== "undefined" && window.location.hash.toLowerCase().includes("eyeball")
  const [pins, setPins] = useState<Place[]>(PLACES)
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null)

  const dump = useMemo(
    () => JSON.stringify(pins.map((p) => ({ term: p.term, x: Math.round(p.x), y: Math.round(p.y) })), null, 1),
    [pins],
  )

  useTilePrefetch(open && !editing)

  if (!open) return null

  return (
    <div className="modal modal-open" role="dialog" aria-label="Atlas of the Odyssey">
      <div className="modal-box flex h-dvh max-h-dvh w-full max-w-none flex-col gap-2 rounded-none p-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold tracking-wide sm:text-3xl">
            Atlas — the Red Sea Plate
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
              the floating calibration panel below (a shared corner-clip
              wrapper with the panel used to slice the panel's own top-left
              corner where the container's curve cut across it). */}
          <div className="absolute inset-0 overflow-hidden rounded-box border border-base-300">
            <MapContainer
              crs={L.CRS.Simple}
              minZoom={0}
              maxZoom={MAX_ZOOM}
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
                url={TILE_URL}
                tileSize={256}
                noWrap
                bounds={bounds ?? undefined}
                minZoom={0}
                maxZoom={MAX_ZOOM}
                keepBuffer={6}
                updateWhenIdle={false}
              />
              <FitWhenReady onBounds={setBounds} />
              {bounds && !editing && <Navigator bounds={bounds} />}
              {editing && <Calibrator onAdd={(p) => setPins((prev) => [...prev, p])} />}
              <Pins
                pins={pins}
                editing={editing}
                onSelect={onSelect}
                onMove={(i, p) =>
                  setPins((prev) => prev.map((q, j) => (j === i ? { ...q, ...p } : q)))
                }
                lookup={lookup}
              />
            </MapContainer>
          </div>

          {editing && (
            <CalibrationPanel
              hint="Drag pins to reposition. Click the map to drop a new one, name it below."
              dump={dump}
            />
          )}
        </div>

        {editing && (
          <div className="flex flex-col gap-2 rounded-box border border-base-300 bg-base-200 p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-heading font-semibold">
                Calibration — click the map to drop a pin, name it below, then copy
              </span>
              <button
                type="button"
                className="btn btn-xs"
                onClick={() => navigator.clipboard.writeText(dump)}
              >
                Copy coordinates
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {pins.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className="input input-xs input-bordered flex-1"
                    value={p.term}
                    onChange={(e) =>
                      setPins((prev) =>
                        prev.map((q, j) => (j === i ? { ...q, term: e.target.value } : q)),
                      )
                    }
                  />
                  <span className="w-28 shrink-0 font-mono text-xs opacity-70">
                    x:{Math.round(p.x)} y:{Math.round(p.y)}
                  </span>
                  <button
                    type="button"
                    className="btn btn-xs btn-ghost"
                    onClick={() => setPins((prev) => prev.filter((_, j) => j !== i))}
                  >
                    remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
