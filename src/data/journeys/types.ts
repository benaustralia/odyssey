// Config shape for a single personage's interactive journey map (Leaflet
// CRS.Simple over an antique base map). JourneyMap.tsx renders any config
// conforming to this shape — the Odysseus voyage is just the first instance
// (src/data/journeys/odysseus.ts), not something baked into the component.

export type Stop = {
  n: number
  term: string // must match a src/data/glossary.json entry's `term`
  label: string
  short: string
  zh: string
  x: number
  y: number
}

export type Pt = { x: number; y: number }

// One stage of a multi-stage vessel swap mid-leg (e.g. Odysseus's raft
// wrecking partway across, forcing him to swim the rest of the way).
export type SpecialLegStage = {
  svgUrl: string
  alt: string
  // Last index (inclusive) into that leg's LegVias array this stage's icon
  // rides through; -1 means "ride to the end of the leg".
  uptoViaIndex: number
  // Pause before the next stage begins. Omit on the final stage.
  pauseAfterMs?: number
}

// A leg between two adjacent stops that needs a mid-route vessel swap instead
// of one icon end-to-end (e.g. ship -> raft -> swimmer). fromTerm/toTerm must
// name two stops that are adjacent in the journey's `stops` array, with
// fromTerm the EARLIER of the two by array index — stage.uptoViaIndex is
// measured forward from fromTerm, so swapping the order silently shifts
// every stage boundary to the wrong end of the leg.
export type SpecialLeg = {
  fromTerm: string
  toTerm: string
  stages: SpecialLegStage[] // ordered forward; reversed automatically on rewind
  routeClassName?: string // e.g. "journey-route-raft"; defaults to the normal route style if omitted
}

export type TourTuning = {
  tourZoom?: number
  labelZoom?: number
  tourPps?: number
  glideMin?: number
  glideMax?: number
  dwellMs?: number
  jumpMs?: number
}

export type JourneyConfig = {
  slug: string
  title: string
  attribution: { prefix: string; workTitle: string; suffix: string }
  mapWidth: number
  mapHeight: number
  mapUrl: string
  vessel: { svgUrl: string; alt: string } // default vessel icon for ordinary legs
  stops: Stop[]
  legVias: Pt[][] // legVias[i] bends the route from stops[i] to stops[i+1]; legVias.length === stops.length - 1
  specialLegs?: SpecialLeg[]
  tuning?: TourTuning
}
