import { useEffect, useMemo, useState } from "react"
import L from "leaflet"
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
// @ts-expect-error - leaflet-minimap ships no type declarations
import MiniMapControl from "leaflet-minimap"
import "leaflet-minimap/dist/Control.MiniMap.min.css"

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
const TILE_URL = `${CLD}/f_auto,q_auto/atlas/{z}/{y}/{x}`
const THUMB_URL = `${CLD}/f_auto,q_auto/atlas/0/0/0`

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
// Every other one of the 84 glossary places is Aegean/mainland-Greek and
// already covered by JourneyMap's Vlyssis Errores inset -- this plate mostly
// functions as a "wider crop" backdrop, not a second pin-map for the same set
// of places.
const PLACES: Place[] = [
  { term: "Egypt", x: 1628, y: 5353 },
  { term: "Ethiopia", x: 2821, y: 2305 },
]

const pinIcon = L.divIcon({
  className: "",
  html: `<div class="grid size-6 place-items-center rounded-full bg-primary text-primary-content shadow ring-2 ring-base-100"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
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
    const fit = map.getBoundsZoom(bounds) + Math.log2(W2 / map.getSize().x)
    const mini = new MiniMapControl(layer, {
      position: "bottomleft",
      width: W2,
      height: Math.round((W2 * H) / W),
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
// Gotcha #2 (caught on an actual iPhone SE simulator, not just desktop): a
// plain fitBounds "fits inside" the container -- on desktop the container is
// aspect-locked to the image (sm:aspect-[...]) so that's exactly full-bleed,
// but on mobile the container is just whatever vertical space is left
// (h-dvh column), a portrait shape very unlike this landscape plate. Fitting
// "inside" a portrait box left big empty grey bands above/below. JourneyMap
// solves this with `getBoundsZoom(bounds, true)` ("cover", not "contain") as
// the MIN zoom, so the map always fills the frame and you pan to see more --
// same fix here.
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
          <Popup>
            <div className="flex flex-col gap-1">
              <span className="font-heading font-semibold">{p.term}</span>
              {lookup(p.term) ? (
                <button
                  type="button"
                  className="btn btn-xs btn-primary"
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

  if (!open) return null

  return (
    <div className="modal modal-open" role="dialog" aria-label="Atlas of the Odyssey">
      <div className="modal-box flex h-dvh max-h-dvh w-full max-w-none flex-col gap-2 rounded-none p-2 sm:h-auto sm:max-h-[94vh] sm:w-auto sm:max-w-[96vw] sm:gap-3 sm:rounded-box sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold tracking-wide sm:text-3xl">
            Atlas — the Red Sea Plate
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

        <div className="relative w-full grow overflow-hidden rounded-box border border-base-300 sm:h-[80vh] sm:w-auto sm:grow-0 sm:aspect-[13238/10802] sm:max-w-[94vw] sm:self-center">
          <MapContainer
            crs={L.CRS.Simple}
            minZoom={0}
            maxZoom={MAX_ZOOM}
            zoomSnap={0}
            zoomDelta={0.6}
            scrollWheelZoom
            wheelPxPerZoomLevel={15}
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
