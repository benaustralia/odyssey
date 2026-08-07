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

// #atlas/<slug>/@<term> — the default plate keeps its bare "atlas" prefix, so
// a written link reads the same way the plate switcher writes it. Lives here
// (not in App) because both App's place cards and the Atlas's own search box
// need to emit it, and the rule depends on DEFAULT_PLATE_SLUG above.
export const atlasHash = (slug: string, term: string) =>
  `${slug === DEFAULT_PLATE_SLUG ? "atlas" : `atlas/${slug}`}/@${encodeURIComponent(term)}`

// Bracket text shown beside a place's English name — the engraved Ortelius
// form ("Knossos (Cnodos)"), unless it's just the English name over again
// ("Phylace (Phylace)", "Persia (PERSIA)" add nothing; compare
// case-insensitively against both the term and the display label).
export function latinFor(p: { term: string; label?: string; latin?: string }): string | null {
  const l = p.latin?.trim()
  if (!l) return null
  const low = l.toLowerCase()
  if (low === p.term.toLowerCase() || low === p.label?.toLowerCase()) return null
  return l
}

// One row per (plate, pin), in PLATE_PRIORITY order — the corpus the Atlas's
// in-map search matches against. Flattened once at module load; the pin data
// is static.
export type PinRow = {
  term: string
  label?: string
  noGloss?: boolean
  latin?: string
  slug: string
  plateTitle: string
}

export const ALL_PINS: PinRow[] = PLATE_PRIORITY.flatMap((slug) => {
  const plate = PLATES[slug]
  if (!plate) return []
  return plate.places.map((p) => ({
    term: p.term,
    label: p.label,
    noGloss: p.noGloss,
    latin: p.latin,
    slug,
    plateTitle: plate.title,
  }))
})

// Substring search over every plate's pins, deduped by term so a place pinned
// on two plates (Egypt on aegyptus AND rubri) offers one destination, not two.
// Which plate wins follows findPin's rule: the caller's current plate first
// (searching a term you can already see shouldn't yank you to another plate),
// otherwise PLATE_PRIORITY. Ranking: name-prefix matches first, then
// glossary-linked pins ahead of `noGloss` label-only ones, then alphabetical.
export function searchPins(query: string, preferSlug?: string, limit = 8): PinRow[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const best = new Map<string, PinRow>()
  for (const row of ALL_PINS) {
    const name = (row.label ?? row.term).toLowerCase()
    // The engraved Latin spelling matches too, so typing "Cnodos" finds
    // Knossos — the reverse lookup for someone reading the plate itself.
    if (
      !name.includes(q) &&
      !row.term.toLowerCase().includes(q) &&
      !row.latin?.toLowerCase().includes(q)
    )
      continue
    const key = row.term.toLowerCase()
    const held = best.get(key)
    // ALL_PINS is already in priority order, so the first hit wins unless the
    // plate the user is looking at also carries the pin.
    if (!held || (preferSlug && row.slug === preferSlug && held.slug !== preferSlug))
      best.set(key, row)
  }
  const score = (row: PinRow) => {
    const name = (row.label ?? row.term).toLowerCase()
    return (name.startsWith(q) ? 0 : 2) + (row.noGloss ? 1 : 0)
  }
  return [...best.values()]
    .sort((a, b) => {
      const d = score(a) - score(b)
      if (d) return d
      return (a.label ?? a.term).localeCompare(b.label ?? b.term)
    })
    .slice(0, limit)
}

export type { AtlasPlace, PlateConfig } from "./types"
