import { odysseusJourney } from "./odysseus"
import { JOURNEY_ALIASES } from "./aliases"
import type { JourneyConfig, Stop } from "./types"

export const JOURNEYS: Record<string, JourneyConfig> = {
  odysseus: odysseusJourney,
}

export const DEFAULT_JOURNEY_SLUG = "odysseus"

// Mirrors the Atlas's PLATE_PRIORITY: which journey "owns" a term when more
// than one visits it. With a single journey this is trivial, but the shape
// keeps findStop honest when a second personage's voyage is added.
export const JOURNEY_PRIORITY = [DEFAULT_JOURNEY_SLUG] as const

// Term -> the journey a deep link should open, and the stop to focus on it.
// The Atlas's findPin twin (same match order, same preferSlug escape hatch):
// exact term, then this journey's place aliases, then case-insensitive — so a
// card link passing a canonical glossary term, a hand-typed
// "#journey/@ithaca", and a place card for "Aeaea" all land on stop 7.
// Returns the journey's OWN stop, so callers can re-emit its canonical term.
export function findStop(
  term: string,
  preferSlug?: string,
): { slug: string; stop: Stop } | null {
  const order =
    preferSlug && JOURNEYS[preferSlug]
      ? [preferSlug, ...JOURNEY_PRIORITY.filter((s) => s !== preferSlug)]
      : [...JOURNEY_PRIORITY]
  const lower = term.toLowerCase()
  for (const slug of order) {
    const stops = JOURNEYS[slug]?.stops
    if (!stops) continue
    // A term the aliases redirect (Aeaea -> Circe) resolves to the stop the
    // alias names; everything else matches a stop term directly.
    const aliases = JOURNEY_ALIASES[slug] ?? {}
    const aliasKey = Object.keys(aliases).find((k) => k === term || k.toLowerCase() === lower)
    const want = aliasKey ? aliases[aliasKey] : term
    // Two stops can share a term (Aeaea is visited twice, stops 7 and 9) —
    // the first match is the arrival, which is what a deep link wants.
    const stop =
      stops.find((s) => s.term === want) ??
      stops.find((s) => s.term.toLowerCase() === want.toLowerCase())
    if (stop) return { slug, stop }
  }
  return null
}

// #journey/<slug>/@<term> — the default journey keeps the bare "journey"
// prefix, exactly as atlasHash treats the default plate. Lives here (not in
// App) because the place cards, the Atlas's search and the hero all emit it.
export const journeyHash = (slug: string, term: string) =>
  `${slug === DEFAULT_JOURNEY_SLUG ? "journey" : `journey/${slug}`}/@${encodeURIComponent(term)}`

export { JOURNEY_ALIASES }
export type { JourneyConfig, Stop } from "./types"
