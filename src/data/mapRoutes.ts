// Which map a glossary term should open on, and at what hash.
//
// Two map systems can show a place — the Atlas (six tiled Ortelius plates) and
// the Journey map (one plate's inset, at full size, with the voyage drawn on
// it) — so "show me this place" needs ONE answer, or the app contradicts
// itself: a card sending you to the Journey map while the Atlas's own search
// sends you to the Atlas for the same term is exactly the split Plan.md's
// Phase D warns against. Every caller (place cards, the Atlas header search)
// resolves through here.
import { PLATES, findPin, atlasHash } from "./plates"
import { JOURNEYS, findStop, journeyHash } from "./journeys"

export type MapRoute = {
  kind: "journey" | "atlas"
  slug: string
  term: string // the destination map's OWN canonical term (a stop term may differ from the place term)
  hash: string
  title: string // the destination map's title, as its header and the search dropdown print it
}

// rubri's Greek content is the Vlyssis Errores inset — the same engraving the
// Journey map uses as its full-size base image, but shrunk into a corner of a
// 13238px plate. So for any place whose best Atlas pin is on rubri AND that
// the voyage visits, the Journey map is strictly the better destination: same
// picture, larger, with the route and the guided tour around it.
const INSET_PLATE = "rubri"

export function journeyLink(term: string, preferSlug?: string): MapRoute | null {
  const hit = findStop(term, preferSlug)
  if (!hit) return null
  return {
    kind: "journey",
    slug: hit.slug,
    term: hit.stop.term,
    hash: journeyHash(hit.slug, hit.stop.term),
    title: JOURNEYS[hit.slug].title,
  }
}

export function atlasLink(term: string, preferSlug?: string): MapRoute | null {
  const hit = findPin(term, preferSlug)
  if (!hit) return null
  return {
    kind: "atlas",
    slug: hit.slug,
    term: hit.place.term,
    hash: atlasHash(hit.slug, hit.place.term),
    title: PLATES[hit.slug].title,
  }
}

// The one destination for a term. `preferSlug` only breaks ties *within* the
// Atlas (an open plate keeps a pin it already carries); the journey-vs-atlas
// decision deliberately ignores it, reading the context-free findPin, so the
// same term never routes two ways depending on where you asked from.
export function mapRoute(term: string, preferSlug?: string): MapRoute | null {
  const journey = journeyLink(term)
  const owner = findPin(term)
  if (journey && (!owner || owner.slug === INSET_PLATE)) return journey
  return atlasLink(term, preferSlug) ?? journey
}

// Card-level view of the same policy. `isPlace` keeps the Atlas link to
// `tag: "place"` entries (pins are places; a character card shouldn't sprout a
// plate link), while the voyage link is offered to any entry a stop names —
// Circe, Scylla and the Sirens are stops too, and "where on the voyage was
// this?" is a fair question to ask of them.
export function mapLinks(
  term: string,
  isPlace: boolean,
): { primary: MapRoute | null; journey: MapRoute | null } {
  const journey = journeyLink(term)
  const atlas = isPlace ? atlasLink(term) : null
  const preferJourney = !!journey && (!atlas || atlas.slug === INSET_PLATE)
  return { journey, primary: preferJourney ? journey : (atlas ?? journey) }
}
