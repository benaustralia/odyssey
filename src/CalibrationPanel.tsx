import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

// Shared floating overlay for the two hash-gated calibration modes
// (JourneyMap's #humaneyeball, AtlasMap's #atlas-eyeball): drag pins on the
// map, watch this panel's live JSON dump update, copy it back into the
// source. The two maps' actual pin/route dragging logic stays separate
// (JourneyMap works in raw pixel lat/lng via a manual yx() flip; AtlasMap
// works through the live map instance's project/unproject because its tiled
// CRS.Simple layer needs the zoom-scale division a plain flip doesn't do) --
// this component is just the UI shell both of them render identically.
//
// Portalled to document.body and dragged via `position: fixed` in viewport
// pixels -- NOT rendered as a child of the modal-box. DaisyUI's .modal-box
// sets `translate`/`scale` (even at the identity values 0/1), and per spec
// ANY non-"none" value of translate/scale/rotate/transform/filter on an
// ancestor makes it the containing block for fixed-position descendants --
// so a `position: fixed` panel left inside modal-box would only be able to
// drag around *within the modal card*, not the actual browser viewport. The
// portal sidesteps that trap entirely.
export default function CalibrationPanel({
  hint,
  dump,
}: {
  hint: string
  dump: string
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  // Desktop: dock top-right by default -- top-left sits directly over the
  // map's most interesting content (pins cluster west/center). Mobile keeps
  // top-left; the panel is nearly full-width there so left/right is moot.
  const [pos, setPos] = useState(() =>
    window.innerWidth >= 640 ? { left: window.innerWidth - 24 - 288, top: 88 } : { left: 24, top: 88 },
  )
  const dragState = useRef<{ dx: number; dy: number } | null>(null)
  // Collapsed to a bare header strip by default on mobile -- the full panel
  // (textarea + copy button) covers too much of the map to place pins by
  // touch. Desktop starts expanded since there's room to spare.
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 640)

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragState.current) return
      const el = panelRef.current
      const w = el?.offsetWidth ?? 0
      const h = el?.offsetHeight ?? 0
      const left = Math.min(Math.max(0, e.clientX - dragState.current.dx), window.innerWidth - w)
      const top = Math.min(Math.max(0, e.clientY - dragState.current.dy), window.innerHeight - h)
      setPos({ left, top })
    }
    const onUp = () => {
      dragState.current = null
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
  }, [])

  return createPortal(
    <div
      ref={panelRef}
      style={{ left: pos.left, top: pos.top }}
      className="fixed z-[1000] w-64 rounded-box border border-warning bg-base-100/95 p-3 shadow-xl backdrop-blur sm:w-72"
    >
      <div className="flex items-center gap-2">
        <p
          className="flex-1 cursor-grab select-none text-xs font-semibold uppercase tracking-wider text-warning active:cursor-grabbing"
          onPointerDown={(e) => {
            const rect = panelRef.current?.getBoundingClientRect()
            if (!rect) return
            dragState.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top }
          }}
        >
          ⠿ Calibration
        </p>
        <button
          type="button"
          className="btn btn-ghost btn-xs shrink-0 px-1 text-warning"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand calibration panel" : "Collapse calibration panel"}
        >
          {collapsed ? "▸" : "▾"}
        </button>
      </div>
      {!collapsed && (
        <>
          <p className="mt-1 text-[0.7rem] leading-snug opacity-80">{hint}</p>
          <textarea
            readOnly
            value={dump}
            onFocus={(e) => e.currentTarget.select()}
            className="textarea textarea-bordered mt-2 h-32 w-full font-mono text-[0.7rem] leading-snug sm:h-48"
          />
          <button
            type="button"
            className="btn btn-warning btn-sm mt-2 w-full"
            onClick={() => navigator.clipboard?.writeText(dump)}
          >
            Copy coordinates
          </button>
        </>
      )}
    </div>,
    document.body,
  )
}
