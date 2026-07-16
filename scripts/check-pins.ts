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
//  - every glossary `place` entry must be pinned on at least one plate,
//    except Ocean (the world-encircling river isn't a point on a map).
import { readFileSync, readdirSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import process from "node:process"
import glossaryData from "../src/data/glossary.json"
import { PLATES } from "../src/data/plates"

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
  }
}

// ---- Journey stops (regex — see header) ----
const journeysDir = join(root, "src/data/journeys")
for (const f of readdirSync(journeysDir)) {
  if (!f.endsWith(".ts") || f === "types.ts" || f === "index.ts") continue
  const src = readFileSync(join(journeysDir, f), "utf8")
  for (const m of src.matchAll(/\bterm:\s*"([^"]+)"/g)) {
    if (!glossaryTerms.has(m[1]))
      errors.push(`journeys/${f}: stop term "${m[1]}" is not an exact glossary term`)
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
console.log("✓ all pin terms, bounds, and coverage check out (Ocean deliberately unpinned)")
