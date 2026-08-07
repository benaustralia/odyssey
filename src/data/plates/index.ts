import { rubriPlate } from "./rubri"
import { graeciaPlate } from "./graecia"
import { aegyptusPlate } from "./aegyptus"
import { natoliaePlate } from "./natoliae"
import { palestinaePlate } from "./palestinae"
import { africaePlate } from "./africae"
import type { AtlasPlace, PlateConfig } from "./types"

export const PLATES: Record<string, PlateConfig> = {
  rubri: rubriPlate,
  graecia: graeciaPlate,
  aegyptus: aegyptusPlate,
  natoliae: natoliaePlate,
  palestinae: palestinaePlate,
  africae: africaePlate,
}

// The Greek map is where most of the pins live, so it's the Atlas's face.
// NOTE: graecia's ~69 pins are still a seed grid (not yet calibrated via
// #atlas/graecia/edit) — flipped ahead of calibration at the user's
// request. Recalibrate before/while this is live; see CLAUDE.md Atlas section.
export const DEFAULT_PLATE_SLUG = "graecia"

// Which plate "owns" a term when several pin it. Graecia is the real
// cartographic map of the Greek world and carries most pins; rubri is last
// because its Greek content lives in the cramped Vlyssis Errores inset — it
// only wins for the mythical/voyage isles no other plate prints.
export const PLATE_PRIORITY = [
  "graecia",
  "aegyptus",
  "natoliae",
  "palestinae",
  "africae",
  "rubri",
] as const

// Term -> the plate a deep link should open, and the pin to focus on it.
// Match is exact first, then case-insensitive: card links pass canonical
// glossary terms, but a hand-typed/normalised `#atlas/<slug>/@ithaca` URL
// should still land. Returns the plate's OWN place object, so callers can
// re-emit the canonical term (see App's parseMapHash).
// `preferSlug` lets an explicit route slug win over the global priority —
// `#atlas/rubri/@Ithaca` focuses rubri's Ithaca rather than jumping to graecia.
export function findPin(
  term: string,
  preferSlug?: string,
): { slug: string; place: AtlasPlace } | null {
  const order = preferSlug && PLATES[preferSlug]
    ? [preferSlug, ...PLATE_PRIORITY.filter((s) => s !== preferSlug)]
    : [...PLATE_PRIORITY]
  const lower = term.toLowerCase()
  for (const match of [
    (p: AtlasPlace) => p.term === term,
    (p: AtlasPlace) => p.term.toLowerCase() === lower,
  ]) {
    for (const slug of order) {
      const place = PLATES[slug]?.places.find(match)
      if (place) return { slug, place }
    }
  }
  return null
}

export type { AtlasPlace, PlateConfig } from "./types"
