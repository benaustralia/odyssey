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

// Images are delivered from Cloudinary (cloud `dhvvz91bh`, folder `odyssey`).
// f_auto,q_auto => AVIF/WebP at automatic quality; c_limit,w_N caps the width.
const CLD = "https://res.cloudinary.com/dhvvz91bh/image/upload"
const cldUrl = (a: Art, w: number) =>
  a.cld ? `${CLD}/f_auto,q_auto,c_limit,w_${w}/${a.cld}` : a.file

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

function App() {
  const [query, setQuery] = useState("")
  const [cat, setCat] = useState("all")
  const [selected, setSelected] = useState<Entry | null>(null)
  const [lbIndex, setLbIndex] = useState(-1) // >=0 => lightbox open at that slide
  // The journey map is URL-addressable via a hash route (#journey, and
  // #humaneyeball for calibration), so it's shareable and back-button friendly.
  // The atlas map gets its own hash (#atlas, #atlas-eyeball) — kept distinct
  // from "eyeball" alone so the two calibration modes don't collide.
  const MAP_HASH = /journey|humaneyeball/i
  const ATLAS_HASH = /atlas/i
  const [mapOpen, setMapOpen] = useState(
    () => typeof window !== "undefined" && MAP_HASH.test(window.location.hash),
  )
  const [atlasOpen, setAtlasOpen] = useState(
    () => typeof window !== "undefined" && ATLAS_HASH.test(window.location.hash),
  )
  useEffect(() => {
    const sync = () => {
      setMapOpen(MAP_HASH.test(window.location.hash))
      setAtlasOpen(ATLAS_HASH.test(window.location.hash))
    }
    window.addEventListener("hashchange", sync)
    return () => window.removeEventListener("hashchange", sync)
  }, [])
  const openMap = () => {
    window.location.hash = "journey"
  }
  const closeMap = () => {
    setMapOpen(false)
    if (MAP_HASH.test(window.location.hash))
      window.history.replaceState(null, "", window.location.pathname + window.location.search)
  }
  const openAtlas = () => {
    window.location.hash = "atlas"
  }
  const closeAtlas = () => {
    setAtlasOpen(false)
    if (ATLAS_HASH.test(window.location.hash))
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
    return { src: cldUrl(a, 1600), description }
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

      {mapOpen && (
        <Suspense fallback={null}>
          <JourneyMap
            open
            onClose={closeMap}
            onSelect={openTerm}
            lookup={(t) => byTerm.get(t)}
          />
        </Suspense>
      )}

      {atlasOpen && (
        <Suspense fallback={null}>
          <AtlasMap
            open
            onClose={closeAtlas}
            onSelect={openTerm}
            lookup={(t) => byTerm.get(t)}
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
              return (
                <button
                  key={e.term}
                  type="button"
                  onClick={() => {
                    setSelected(e)
                    setLbIndex(0)
                  }}
                  className="card card-border flex h-full w-full cursor-pointer flex-col overflow-hidden border-base-300 bg-base-200 text-left shadow-md transition-shadow duration-300 hover:shadow-xl"
                >
                  {cover && (
                    <figure className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={cldUrl(cover, 800)}
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
                      <span className="badge badge-outline badge-sm whitespace-nowrap text-[0.7rem] uppercase tracking-wider text-primary">
                        {e.tag}
                      </span>
                    </div>
                    <p className="text-sm italic text-primary">{e.pron}</p>
                    <p className="text-[0.95rem] leading-relaxed opacity-95">{e.def}</p>
                    <p className="mt-1 font-zh text-sm leading-relaxed opacity-90">
                      <span>{e.zhName}</span>
                      <span className="px-1 text-primary">·</span>
                      {e.zhDef}
                    </p>
                  </div>
                </button>
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
