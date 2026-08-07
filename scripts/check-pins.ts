// Data guard for the two map systems (run: npm run check:pins).
//
// The atlas popup's "View artworks" and the journey popup's entry lookup are
// exact Map.get calls on glossary.json terms — a pin named "Parnassus" when
// the glossary says "Mount Parnassus" fails SILENTLY (no error, just a
// missing button). That bug has shipped twice ("Mount Olympus" 2026-07-16,
// the batch rename in 2c4afef), so this script makes it loud:
//
//  - every plate place must name an exact glossary term, or carry
//    `noGloss: true` (a deliberate poem-text-only place, the Achaea
//    precedent);
//  - `noGloss` on a term that IS in the glossary is also an error (stale
//    flag hiding a working lookup);
//  - coords must sit inside the plate's pixel bounds (catches pasting one
//    plate's calibration dump into another plate's file);
//  - no duplicate term within one plate;
//  - every journey stop term must be a glossary term (extracted by regex —
//    journey files import .svg assets, which tsx can't load);
//  - every place->stop alias (src/data/journeys/aliases.ts, which is a
//    separate file precisely so this script CAN import it) must name a real
//    journey, a real glossary term, and a real stop of that journey — a
//    typo'd alias fails silently, exactly like a mistyped pin term;
//  - every glossary `place` entry must be pinned on at least one plate,
//    except Ocean (the world-encircling river isn't a point on a map);
//  - every pin must carry a `latin` (the engraved toponym, harvested by
//    reading each plate master at native resolution — CLAUDE.md TODO 1b) or
//    be named on NO_LATIN below — an unlisted pin with no `latin` is either
//    a fresh pin nobody's read yet or a stale copy-paste, not a deliberate
//    "the plate prints nothing here".
import { readFileSync, readdirSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import process from "node:process"
import glossaryData from "../src/data/glossary.json"
import { PLATES } from "../src/data/plates"
import { JOURNEY_ALIASES } from "../src/data/journeys/aliases"

// "slug:term" pairs where the plate genuinely prints no name for the place —
// confirmed by reading the master at native resolution, not just unchecked.
// Positional/interpretive pins (flags.md's L-confidence graecia terms, most
// of rubri's loosely-placed Vlyssis-inset isles) and this-plate-only
// placeholders (rubri's Phoenicia/Sidon, whose real home is palestinae) live
// here so their absence reads as a checked fact, not an oversight.
const NO_LATIN = new Set([
  // graecia — flags.md M/L-confidence pins the plate prints no label for.
  "graecia:Aegae",
  "graecia:Amnisus",
  "graecia:Arethusa",
  "graecia:Chalcis",
  "graecia:Crouni",
  "graecia:Enipeus",
  "graecia:Ephyra",
  "graecia:Erymanthus",
  "graecia:Gyrae",
  "graecia:Mount Neion",
  "graecia:Mount Neriton",
  "graecia:Panopeus",
  "graecia:Phaestus",
  "graecia:Phylace",
  "graecia:River Jardan",
  "graecia:Taphos",
  // rubri — mostly the loosely-placed Vlyssis-inset mythical isles, plus the
  // Phoenicia/Sidon placeholders (real home: palestinae) and India (its pin
  // rides "Mambari regnum", which names the region, not India itself).
  "rubri:Libya",
  "rubri:Ethiopia",
  "rubri:Pharos",
  "rubri:Aeaea",
  "rubri:Cyprus",
  "rubri:Hyperia",
  "rubri:Cimmerians",
  "rubri:Telepylus",
  "rubri:Artaky",
  "rubri:Styx",
  "rubri:Acheron",
  "rubri:Cocytus",
  "rubri:Pyriphlegethon",
  "rubri:Erebus",
  "rubri:The Underworld",
  "rubri:Phoenicia",
  "rubri:Sidon",
  "rubri:Mount Solyma",
  "rubri:Ortygia",
  "rubri:Africa",
  "rubri:India",
  // natoliae — no label for either on this Ottoman-era edition.
  "natoliae:Mimas",
  "natoliae:Mount Solyma",
  // africae — Ethiopia's pin rides the Prester John legend, which anchors
  // but doesn't name it (same compromise as rubri's India).
  "africae:Ethiopia",
])

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const glossary = glossaryData as { term: string; tag: string }[]
const glossaryTerms = new Set(glossary.map((e) => e.term))
const errors: string[] = []

// ---- Atlas plates ----
const pinnedTerms = new Set<string>()
for (const plate of Object.values(PLATES)) {
  const seen = new Set<string>()
  for (const p of plate.places) {
    const where = `${plate.slug}: "${p.term}"`
    if (p.noGloss) {
      if (glossaryTerms.has(p.term))
        errors.push(`${where} has noGloss but IS a glossary term — remove the flag`)
    } else if (!glossaryTerms.has(p.term)) {
      errors.push(`${where} is not an exact glossary term (lookup will silently fail) — fix the term or add noGloss`)
    }
    if (seen.has(p.term)) errors.push(`${where} is pinned twice on this plate`)
    seen.add(p.term)
    pinnedTerms.add(p.term)
    if (p.x < 0 || p.x > plate.w || p.y < 0 || p.y > plate.h)
      errors.push(`${where} at (${Math.round(p.x)}, ${Math.round(p.y)}) is outside the ${plate.w}x${plate.h} plate`)
    const key = `${plate.slug}:${p.term}`
    if (p.latin === "") errors.push(`${where} has an empty latin string — use undefined instead`)
    else if (!p.latin && !NO_LATIN.has(key))
      errors.push(`${where} has no latin and isn't on NO_LATIN — read the plate or add it to the allowlist`)
    else if (p.latin && NO_LATIN.has(key))
      errors.push(`${where} has a latin value but is also on NO_LATIN — remove it from the allowlist`)
  }
}

// ---- Journey stops (regex — see header) ----
// File basename === journey slug by convention (odysseus.ts -> "odysseus"),
// which is what lets the alias check below know which stops it may point at.
const journeysDir = join(root, "src/data/journeys")
const stopTerms = new Map<string, Set<string>>()
for (const f of readdirSync(journeysDir)) {
  if (!f.endsWith(".ts") || f === "types.ts" || f === "index.ts" || f === "aliases.ts") continue
  const src = readFileSync(join(journeysDir, f), "utf8")
  const terms = new Set<string>()
  for (const m of src.matchAll(/\bterm:\s*"([^"]+)"/g)) {
    terms.add(m[1])
    if (!glossaryTerms.has(m[1]))
      errors.push(`journeys/${f}: stop term "${m[1]}" is not an exact glossary term`)
  }
  stopTerms.set(f.replace(/\.ts$/, ""), terms)
}

// ---- Journey place aliases ----
for (const [slug, aliases] of Object.entries(JOURNEY_ALIASES)) {
  const stops = stopTerms.get(slug)
  if (!stops) {
    errors.push(`aliases.ts: "${slug}" is not a journey (no src/data/journeys/${slug}.ts)`)
    continue
  }
  for (const [place, stop] of Object.entries(aliases)) {
    const where = `aliases.ts ${slug}: "${place}" -> "${stop}"`
    if (!glossaryTerms.has(place))
      errors.push(`${where} — "${place}" is not an exact glossary term`)
    if (!stops.has(stop)) errors.push(`${where} — "${stop}" is not a stop on this journey`)
    if (stops.has(place))
      errors.push(`${where} — "${place}" is itself a stop term; the alias is redundant`)
  }
}

// ---- Glossary place coverage ----
const unpinned = glossary
  .filter((e) => e.tag === "place" && !pinnedTerms.has(e.term))
  .map((e) => e.term)
  .filter((t) => t !== "Ocean")
for (const t of unpinned) errors.push(`glossary place "${t}" is pinned on no plate`)

// ---- Report ----
for (const plate of Object.values(PLATES))
  console.log(`${plate.slug}: ${plate.places.length} pins`)
if (errors.length) {
  console.error(`\n${errors.length} problem(s):`)
  for (const e of errors) console.error(`  ✗ ${e}`)
  process.exit(1)
}
console.log(
  "✓ all pin terms, bounds, coverage and journey aliases check out (Ocean deliberately unpinned)",
)
