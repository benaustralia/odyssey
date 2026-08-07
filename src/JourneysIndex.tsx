import { Sailboat } from "lucide-react"
import { JOURNEYS } from "@/data/journeys"

// A landing grid for "Journey Maps" in the toolbar — one card per registered
// journey (JOURNEYS), so a third/fourth voyage just needs a JourneyConfig
// entry to show up here, no changes to this file. Mirrors the full-screen
// modal shell JourneyMap.tsx/AtlasMap.tsx use (.modal.modal-open > .modal-box,
// rounded-none, its own close button + backdrop) so switching between this
// index and an actual map feels like the same surface, not a different UI.
export default function JourneysIndex({
  open,
  onClose,
  onOpenJourney,
}: {
  open: boolean
  onClose: () => void
  onOpenJourney: (slug: string) => void
}) {
  if (!open) return null
  return (
    <div className="modal modal-open" role="dialog" aria-label="Journey Maps">
      <div className="modal-box flex h-dvh max-h-dvh w-full max-w-none flex-col gap-4 rounded-none p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold tracking-wide sm:text-3xl">
            Journey Maps
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

        <div className="grid flex-1 auto-rows-min grid-cols-1 gap-5 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(JOURNEYS).map((j) => (
            <button
              key={j.slug}
              type="button"
              onClick={() => onOpenJourney(j.slug)}
              className="group flex flex-col overflow-hidden rounded-box border border-base-300 bg-base-200 text-left shadow-md transition-shadow duration-300 hover:shadow-xl"
            >
              <figure className="relative aspect-[900/419] overflow-hidden">
                <img
                  src={j.heroImage}
                  alt={j.heroAlt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
                />
              </figure>
              <div className="flex items-center justify-between gap-2 px-4 py-3">
                <div>
                  <h3 className="font-heading text-xl font-semibold">{j.title}</h3>
                  <p className="text-sm opacity-70">{j.stops.length} stops</p>
                </div>
                <Sailboat className="size-5 shrink-0 text-primary" aria-hidden="true" />
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  )
}
