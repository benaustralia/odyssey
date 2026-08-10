// Single source of truth for glossary/art data + the small helpers built on
// top of it. Shared by App.tsx (the live SPA), EntryContent.tsx (rendered
// both client-side and by scripts/prerender.tsx), and the prerender/sitemap
// scripts — so a term's slug, its art list, and its category all resolve the
// same way everywhere, the same reasoning as data/mapRoutes.ts being the one
// place a term's map destination is decided.
import glossaryData from "@/data/glossary.json"
import artData from "@/data/art.json"
import { slugify } from "./slug"
import { audioTerms } from "@/data/audioTerms"

export type Entry = {
  term: string
  pron: string
  tag: string
  def: string
  zhName: string
  zhPinyin: string
  zhDef: string
  art?: string[]
}
export type Art = {
  file: string
  artist: string
  title: string
  year: string
  source: string
  license?: string
  cld?: string
  note?: string
}

export const entries = glossaryData as Entry[]
export const art = artData as Record<string, Art>

export const byTerm = new Map(entries.map((e) => [e.term, e]))
export const bySlug = new Map(entries.map((e) => [slugify(e.term), e]))

// Images are delivered from Cloudflare R2 (bucket `odyssey-assets`). Masters
// are already ImageMagick-recompressed to 1600px max / q82 at upload time
// (see CLAUDE.md), so R2 just serves them as-is — no on-the-fly resize/format
// transform like Cloudinary's f_auto,q_auto,w_ (R2 has none).
export const R2_ASSETS = "https://pub-b57180e24c9841f58854ecd1c164523a.r2.dev"
export const assetUrl = (a: Art) => `${R2_ASSETS}${a.file}`

// Card-grid covers only: a pre-baked 800px-wide WebP under art-thumb/, cut
// from ~250-370KB JPEG masters to ~65-115KB (Lighthouse mobile flagged the
// masters as 3-4x oversized for their ~380px display width). Same "no
// on-the-fly transform" constraint as Atlas minimap thumbs — R2 can't crop/
// resize on request, so this is generated once by scripts/make_thumbs.py and
// uploaded alongside the masters. Only every entry's art[0] has one (that's
// the only image ever used as a cover); callers must not call this on
// gallery/lightbox images, which stay full-res via assetUrl.
export const coverThumbUrl = (a: Art) => `${R2_ASSETS}/art-thumb${a.file.replace(/^\/art\//, "/").replace(/\.jpe?g$/i, ".webp")}`

// Pronunciation clip: a single natural-speed read, either the user's own
// recording (for terms the ElevenLabs voice got wrong) or the ElevenLabs
// read otherwise (Plan.md). Returns undefined for the terms with neither —
// PronounceButton renders nothing rather than pointing at a missing file.
export function audioUrl(e: Entry): string | undefined {
  if (!audioTerms.has(e.term)) return undefined
  return `${R2_ASSETS}/audio/${slugify(e.term)}.mp3`
}

export function artsOf(e: Entry | null | undefined): Art[] {
  if (!e?.art) return []
  return e.art.map((k) => art[k]).filter(Boolean)
}

// 61 of the 84 places are illustrated ONLY by a shared full-plate antique map
// (their art keys all end in "-map"). For those the gallery is strictly worse
// than the tiled plate itself, so callers route the whole card/page into the
// Atlas instead.
export function hasRealArt(e: Entry | undefined): boolean {
  return (e?.art ?? []).some((k) => art[k] && !k.endsWith("-map"))
}

export function categoryOf(tag: string): string {
  const t = tag.toLowerCase()
  if (t.startsWith("god")) return "gods"
  if (t === "monster") return "monsters"
  if (["hero", "person", "people", "animal"].includes(t)) return "mortals"
  return "world" // place, thing, idea, trick
}
