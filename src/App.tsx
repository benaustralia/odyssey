import { lazy, Suspense, useEffect, useMemo, useState } from "react"
import { Search, Map as MapIcon } from "lucide-react"

// Leaflet is heavy and the map is opt-in, so load it only when first opened.
const JourneyMap = lazy(() => import("./JourneyMap"))
const AtlasMap = lazy(() => import("./AtlasMap"))
import Lightbox from "yet-another-react-lightbox"
import Captions from "yet-another-react-lightbox/plugins/captions"
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen"
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import "yet-another-react-lightbox/styles.css"
import "yet-another-react-lightbox/plugins/captions.css"
import "yet-another-react-lightbox/plugins/counter.css"
import "yet-another-react-lightbox/plugins/thumbnails.css"
import glossaryData from "@/data/glossary.json"
import artData from "@/data/art.json"
import { JOURNEYS, DEFAULT_JOURNEY_SLUG } from "@/data/journeys"
import { PLATES, DEFAULT_PLATE_SLUG, findPin } from "@/data/plates"

type Entry = {
  term: string
  pron: string
  tag: string
  def: string
  zhName: string
  zhPinyin: string
  zhDef: string
  art?: string[]
}
type Art = { file: string; artist: string; title: string; year: string; source: string; license?: string; cld?: string; note?: string }

const entries = glossaryData as Entry[]
const art = artData as Record<string, Art>

// Images are delivered from Cloudflare R2 (bucket `odyssey-assets`).
// Masters are already ImageMagick-recompressed to 1600px max / q82 at
// upload time (see CLAUDE.md), so R2 just serves them as-is — no on-the-fly
// resize/format transform like Cloudinary's f_auto,q_auto,w_ (R2 has none).
const R2_ASSETS = "https://pub-b57180e24c9841f58854ecd1c164523a.r2.dev"
const assetUrl = (a: Art) => `${R2_ASSETS}${a.file}`

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "gods", label: "Gods" },
  { id: "mortals", label: "Mortals" },
  { id: "monsters", label: "Monsters" },
  { id: "world", label: "World" },
]

function categoryOf(tag: string): string {
  const t = tag.toLowerCase()
  if (t.startsWith("god")) return "gods"
  if (t === "monster") return "monsters"
  if (["hero", "person", "people", "animal"].includes(t)) return "mortals"
  return "world" // place, thing, idea, trick
}

function artsOf(e: Entry | null): Art[] {
  if (!e?.art) return []
  return e.art.map((k) => art[k]).filter(Boolean)
}

// 61 of the 84 places are illustrated ONLY by a shared full-plate antique map
// (their art keys all end in "-map" — equivalent on current data to
// file.startsWith("/art/map-")). For those the gallery is strictly worse than
// the tiled plate itself, so the whole card deep-links into the Atlas instead.
function hasRealArt(e: Entry | undefined): boolean {
  return (e?.art ?? []).some((k) => art[k] && !k.endsWith("-map"))
}

// #atlas/<slug>/@<term> — the default plate keeps its bare "atlas" prefix, so
// the link reads the same way the plate switcher writes it.
const atlasHash = (slug: string, term: string) =>
  `${slug === DEFAULT_PLATE_SLUG ? "atlas" : `atlas/${slug}`}/@${encodeURIComponent(term)}`

function App() {
  const [query, setQuery] = useState("")
  const [cat, setCat] = useState("all")
  const [selected, setSelected] = useState<Entry | null>(null)
  const [lbIndex, setLbIndex] = useState(-1) // >=0 => lightbox open at that slide
  // Both maps are URL-addressable via hash routes with ONE universal editing
  // gate: append "/edit" to any map route to open its calibration mode —
  // #journey/edit, #journey/<slug>/edit, #atlas/edit, #atlas/<slug>/edit.
  // The pre-/edit spellings parse forever as legacy aliases for old
  // bookmarks/links/muscle memory: bare #humaneyeball (the original journey
  // calibration route) and the "-eyeball" suffix forms (#atlas-eyeball,
  // #atlas/<slug>-eyeball, #journey/<slug>-eyeball). Writers (AtlasMap's
  // plate switcher) emit only the /edit form. No slug may be named "edit".
  // A trailing "/@<term>" segment asks the map to open focused on that place
  // (#atlas/graecia/@Ithaca). It is split off the RAW hash BEFORE the
  // lowercasing below — pin terms are case- and punctuation-bearing ("Mount
  // Olympus", "Argos (the city)"), so lowercasing first would destroy them.
  const splitFocus = (hash: string): { rest: string; focusRaw?: string } => {
    const raw = hash.replace(/^#/, "")
    const at = raw.indexOf("/@")
    if (at < 0) return { rest: raw }
    const enc = raw.slice(at + 2)
    let focusRaw = enc
    try {
      focusRaw = decodeURIComponent(enc)
    } catch {
      // malformed %-escape — fall back to the literal text
    }
    return { rest: raw.slice(0, at), focusRaw }
  }
  const parseMapHash = (
    hash: string,
    base: "journey" | "atlas",
    registry: Record<string, unknown>,
    defaultSlug: string,
  ): { slug: string; eyeball: boolean } | null => {
    const h = splitFocus(hash).rest.toLowerCase()
    if (base === "journey" && h === "humaneyeball") return { slug: defaultSlug, eyeball: true }
    if (h === base) return { slug: defaultSlug, eyeball: false }
    if (h === `${base}/edit` || h === `${base}-eyeball`) return { slug: defaultSlug, eyeball: true }
    let m = h.match(new RegExp(`^${base}/([a-z0-9-]+)/edit$`))
    if (m && registry[m[1]]) return { slug: m[1], eyeball: true }
    m = h.match(new RegExp(`^${base}/([a-z0-9-]+?)(-eyeball)?$`))
    if (m && registry[m[1]]) return { slug: m[1], eyeball: !!m[2] }
    return null
  }
  const parseJourneyHash = (hash: string) =>
    parseMapHash(hash, "journey", JOURNEYS, DEFAULT_JOURNEY_SLUG)
  // Atlas routes additionally resolve the "@term" focus segment against the
  // actual pin data: the route slug gets first refusal, then PLATE_PRIORITY,
  // so `#atlas/@Ithaca` lands on whichever plate really owns Ithaca. The
  // pin's CANONICAL term is what goes into the route (AtlasMap matches pins
  // by exact term), and an unresolvable term just drops the focus rather than
  // failing the whole route.
  const parseAtlasHash = (
    hash: string,
  ): { slug: string; eyeball: boolean; focusTerm?: string } | null => {
    const route = parseMapHash(hash, "atlas", PLATES, DEFAULT_PLATE_SLUG)
    if (!route) return null
    const { focusRaw } = splitFocus(hash)
    if (!focusRaw) return route
    const hit = findPin(focusRaw, route.slug)
    if (!hit) return route
    return { slug: hit.slug, eyeball: route.eyeball, focusTerm: hit.place.term }
  }
  const [journeyRoute, setJourneyRoute] = useState(
    () => (typeof window !== "undefined" ? parseJourneyHash(window.location.hash) : null),
  )
  const [atlasRoute, setAtlasRoute] = useState(
    () => (typeof window !== "undefined" ? parseAtlasHash(window.location.hash) : null),
  )
  useEffect(() => {
    const sync = () => {
      setJourneyRoute(parseJourneyHash(window.location.hash))
      setAtlasRoute(parseAtlasHash(window.location.hash))
    }
    window.addEventListener("hashchange", sync)
    return () => window.removeEventListener("hashchange", sync)
  }, [])
  const openMap = () => {
    window.location.hash = "journey"
  }
  const closeMap = () => {
    setJourneyRoute(null)
    if (parseJourneyHash(window.location.hash))
      window.history.replaceState(null, "", window.location.pathname + window.location.search)
  }
  const openAtlas = () => {
    window.location.hash = "atlas"
  }
  const closeAtlas = () => {
    setAtlasRoute(null)
    if (parseAtlasHash(window.location.hash))
      window.history.replaceState(null, "", window.location.pathname + window.location.search)
  }

  // A journey-map pin → open that term's entry in the lightbox. The map stays
  // open underneath, so closing the lightbox returns to the map.
  const byTerm = useMemo(() => new Map(entries.map((e) => [e.term, e])), [])
  const openTerm = (term: string) => {
    const e = byTerm.get(term)
    if (!e) return
    setSelected(e)
    setLbIndex(0)
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return entries.filter((e) => {
      const inCat = cat === "all" || categoryOf(e.tag) === cat
      if (!inCat) return false
      if (!q) return true
      return (
        e.term.toLowerCase().includes(q) ||
        e.def.toLowerCase().includes(q) ||
        e.zhPinyin.toLowerCase().includes(q) ||
        e.zhName.includes(query.trim()) ||
        e.tag.toLowerCase().includes(q)
      )
    })
  }, [query, cat])

  const sel = selected
  const selArts = artsOf(sel)
  const slides = selArts.map((a) => {
    const credit = [a.artist, a.title].filter(Boolean).join(" · ")
    const line = credit ? `${credit}${a.year ? `, ${a.year}` : ""}` : a.year || ""
    // Licence is intentionally NOT shown per-image; the footer states the
    // collection is public-domain/CC, which covers attribution generically.
    // Both credit and locator note go in the bottom caption (which wraps);
    // the top title bar is left empty because it truncates with an ellipsis.
    const description =
      line && a.note ? (
        <>
          {line}
          <br />
          {a.note}
        </>
      ) : (
        line || a.note || undefined
      )
    return { src: assetUrl(a), description }
  })

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      {/* ---------- Hero ---------- */}
      <header className="hero relative min-h-[68vh] overflow-hidden">
        <img
          src="/hero.jpg"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          width={1000}
          height={825}
          className="absolute inset-0 h-full w-full object-cover object-[center_28%]"
        />
        <div className="hero-overlay bg-base-100/72 backdrop-blur-[3px]" />
        <div className="hero-overlay bg-gradient-to-b from-base-100/30 via-base-100/55 to-base-100" />
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <p className="font-display text-sm tracking-[0.5em] text-primary sm:text-base">
              ΟΔΥΣΣΕΙΑ
            </p>
            <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight sm:text-7xl">
              The Odyssey
            </h1>
            <p className="mt-5 font-heading text-xl italic opacity-90 sm:text-2xl">
              An illustrated glossary.
            </p>
          </div>
        </div>
      </header>

      {/* ---------- Toolbar ---------- */}
      <nav className="sticky top-0 z-30 border-b border-base-300 bg-base-100/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="input input-bordered flex w-full items-center gap-2 lg:max-w-xs">
            <Search className="size-4 opacity-70" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              aria-label="Search the glossary"
              className="grow"
            />
          </label>

          <div className="flex w-full justify-center lg:contents">
            <form
              className="filter flex-wrap justify-center gap-1.5"
              onReset={() => setCat("all")}
              aria-label="Filter by category"
            >
              <input className="btn btn-sm btn-square" type="reset" value="×" aria-label="All categories" />
              {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                <input
                  key={c.id}
                  className="btn btn-sm"
                  type="radio"
                  name="category"
                  aria-label={c.label}
                  checked={cat === c.id}
                  onChange={() => setCat(c.id)}
                />
              ))}
            </form>
          </div>

          <button
            type="button"
            onClick={openMap}
            className="btn btn-sm btn-primary btn-outline gap-2 lg:btn-md"
          >
            <MapIcon className="size-4" aria-hidden="true" />
            The Journey
          </button>
          <button
            type="button"
            onClick={openAtlas}
            className="btn btn-sm btn-outline gap-2 lg:btn-md"
          >
            <MapIcon className="size-4" aria-hidden="true" />
            Atlas
          </button>
        </div>
      </nav>

      {journeyRoute && (
        <Suspense fallback={null}>
          <JourneyMap
            key={journeyRoute.slug}
            config={JOURNEYS[journeyRoute.slug]}
            open
            editing={journeyRoute.eyeball}
            onClose={closeMap}
            onSelect={openTerm}
            lookup={(t) => byTerm.get(t)}
          />
        </Suspense>
      )}

      {atlasRoute && (
        <Suspense fallback={null}>
          <AtlasMap
            key={atlasRoute.slug}
            config={PLATES[atlasRoute.slug]}
            open
            editing={atlasRoute.eyeball}
            focusTerm={atlasRoute.focusTerm}
            onClose={closeAtlas}
            onSelect={openTerm}
            // Map-only places' popups show just the name: the plate they're
            // already looking at IS their only "artwork", at higher res.
            hasArt={(t) => hasRealArt(byTerm.get(t))}
          />
        </Suspense>
      )}

      {/* ---------- Gallery ---------- */}
      <main className="mx-auto max-w-6xl px-4 py-10">
        {filtered.length === 0 ? (
          <p className="py-24 text-center font-heading text-2xl italic opacity-80">
            Nothing found on these shores.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e) => {
              const arts = artsOf(e)
              const cover = arts[0]
              // Places get an Atlas deep link when a plate actually pins them
              // (every place but Ocean does). Map-only places open the map on
              // click; places with real artwork keep gallery-first click and
              // get the small "Map" button below. Non-places are unaffected.
              const pin = e.tag === "place" ? findPin(e.term) : null
              const deepLink = pin ? atlasHash(pin.slug, pin.place.term) : null
              const cardOpensMap = !!deepLink && !hasRealArt(e)
              const openGallery = () => {
                setSelected(e)
                setLbIndex(0)
              }
              const openCard = () => {
                if (cardOpensMap && deepLink) window.location.hash = deepLink
                else openGallery()
              }
              return (
                // A div, not a button: the "Map" affordance below is itself a
                // button, and a button nested inside a button is invalid HTML
                // (browsers drop it out of the parent). role/tabIndex/keydown
                // restore the keyboard + a11y behaviour the element lost.
                <div
                  key={e.term}
                  role="button"
                  tabIndex={0}
                  onClick={openCard}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                      ev.preventDefault()
                      openCard()
                    }
                  }}
                  className="card card-border flex h-full w-full cursor-pointer flex-col overflow-hidden border-base-300 bg-base-200 text-left shadow-md transition-shadow duration-300 hover:shadow-xl"
                >
                  {cover && (
                    <figure className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={assetUrl(cover)}
                        alt={cover.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out hover:scale-[1.05]"
                      />
                      {arts.length > 1 && (
                        <span className="badge badge-sm absolute bottom-2 right-2 border-none bg-base-100/85 text-base-content">
                          {arts.length} works
                        </span>
                      )}
                    </figure>
                  )}
                  <div className="card-body gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="card-title font-heading text-3xl font-semibold leading-none">
                        {e.term}
                      </h2>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {deepLink && !cardOpensMap && (
                          <button
                            type="button"
                            className="btn btn-xs btn-ghost gap-1 px-1.5"
                            title={`Show ${e.term} on the Atlas`}
                            onClick={(ev) => {
                              ev.stopPropagation()
                              window.location.hash = deepLink
                            }}
                          >
                            <MapIcon className="size-3.5" aria-hidden="true" />
                            Map
                          </button>
                        )}
                        <span className="badge badge-outline badge-sm whitespace-nowrap text-[0.7rem] uppercase tracking-wider text-primary">
                          {e.tag}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm italic text-primary">{e.pron}</p>
                    <p className="text-[0.95rem] leading-relaxed opacity-95">{e.def}</p>
                    <p className="mt-1 font-zh text-sm leading-relaxed opacity-90">
                      <span>{e.zhName}</span>
                      <span className="px-1 text-primary">·</span>
                      {e.zhDef}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="footer footer-center border-t border-base-300 bg-base-200 p-10 text-base-content">
        <aside className="max-w-2xl">
          <p className="font-display tracking-[0.3em] text-primary">FINIS</p>
          <p className="mt-2 text-sm opacity-90">
            Definitions from a study glossary for <em>The Odyssey</em>, trans. Emily Wilson
            (W.&nbsp;W.&nbsp;Norton).
          </p>
          <p className="text-sm opacity-80">
            Artworks are public domain or openly licensed (CC), via Wikimedia Commons. Built with
            React, Vite, DaisyUI &amp; yet-another-react-lightbox.
          </p>
        </aside>
      </footer>

      {/* ---------- Full-screen image viewer (yet-another-react-lightbox) ---------- */}
      <Lightbox
        open={!!sel && lbIndex >= 0}
        index={lbIndex < 0 ? 0 : lbIndex}
        close={() => {
          setLbIndex(-1)
          setSelected(null)
        }}
        slides={slides}
        plugins={[Thumbnails, Captions, Zoom, Fullscreen]}
        captions={{ descriptionTextAlign: "center", descriptionMaxLines: 5, showToggle: true }}
        carousel={{ finite: slides.length <= 1 }}
      />
    </div>
  )
}

export default App
