import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import Lightbox from "yet-another-react-lightbox"
import Captions from "yet-another-react-lightbox/plugins/captions"
import Counter from "yet-another-react-lightbox/plugins/counter"
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
type Art = { file: string; artist: string; title: string; year: string; source: string }

const entries = glossaryData as Entry[]
const art = artData as Record<string, Art>

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "gods", label: "Gods" },
  { id: "mortals", label: "Mortals" },
  { id: "monsters", label: "Monsters" },
  { id: "places", label: "Places" },
  { id: "peoples", label: "Peoples" },
  { id: "words", label: "Words & Things" },
]

function categoryOf(tag: string): string {
  const t = tag.toLowerCase()
  if (t.startsWith("god")) return "gods"
  if (t === "hero" || t === "person") return "mortals"
  if (t === "monster") return "monsters"
  if (t === "place") return "places"
  if (t === "people") return "peoples"
  return "words"
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

  // Esc closes the info panel — but only when the lightbox isn't open (it has its own Esc)
  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && lbIndex < 0) setSelected(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [selected, lbIndex])

  const sel = selected
  const selArts = artsOf(sel)
  const slides = selArts.map((a) => ({
    src: a.file,
    title: a.title,
    description: `${a.artist}${a.year ? `, ${a.year}` : ""}`,
  }))

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
              An illustrated glossary of the Odyssey&rsquo;s gods, mortals, monsters &amp; marvels.
            </p>
          </div>
        </div>
      </header>

      {/* ---------- Toolbar ---------- */}
      <nav className="sticky top-0 z-30 border-b border-base-300 bg-base-100/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="input input-bordered flex items-center gap-2 lg:max-w-xs">
            <Search className="size-4 opacity-70" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search names, meanings, pinyin…"
              aria-label="Search the glossary"
              className="grow"
            />
          </label>

          <form className="filter" onReset={() => setCat("all")} aria-label="Filter by category">
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
      </nav>

      {/* ---------- Gallery ---------- */}
      <main className="mx-auto max-w-6xl px-4 py-10">
        <p className="mb-6 text-sm opacity-80">
          {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        </p>

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
                    setLbIndex(-1)
                  }}
                  aria-label={`Open ${e.term}`}
                  className="card card-border flex h-full w-full cursor-pointer flex-col overflow-hidden border-base-300 bg-base-200 text-left shadow-md transition-shadow duration-300 hover:shadow-xl"
                >
                  {cover && (
                    <figure className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={cover.file}
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
            Artworks are in the public domain, via Wikimedia Commons. Built with React, Vite,
            DaisyUI &amp; yet-another-react-lightbox.
          </p>
        </aside>
      </footer>

      {/* ---------- Info panel (DaisyUI) ---------- */}
      <dialog className={`modal ${sel ? "modal-open" : ""}`} aria-label={sel?.term}>
        <div className="modal-box max-h-[90vh] max-w-2xl overflow-y-auto">
          {sel && (
            <>
              <button
                onClick={() => setSelected(null)}
                className="btn btn-circle btn-sm absolute right-3 top-3 z-10"
                aria-label="Close"
              >
                ✕
              </button>

              {selArts[0] && (
                <button
                  type="button"
                  onClick={() => setLbIndex(0)}
                  aria-label="View artwork full screen"
                  className="group block w-full overflow-hidden rounded-box border border-base-300"
                >
                  <img
                    src={selArts[0].file}
                    alt={selArts[0].title}
                    className="aspect-[3/2] w-full bg-black/30 object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </button>
              )}

              {selArts.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {selArts.map((a, i) => (
                    <button
                      key={a.file}
                      type="button"
                      onClick={() => setLbIndex(i)}
                      aria-label={`View painting ${i + 1}: ${a.title}`}
                      className="size-16 shrink-0 overflow-hidden rounded ring-offset-2 ring-offset-base-100 hover:ring-2 hover:ring-primary"
                    >
                      <img src={a.file} alt="" className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {selArts.length > 0 && (
                <p className="mt-2 text-xs opacity-70">
                  {selArts.length} {selArts.length === 1 ? "work" : "works"} · tap an image to view full screen
                </p>
              )}

              <div className="mt-5">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-heading text-4xl font-semibold">{sel.term}</h3>
                  <span className="badge badge-outline whitespace-nowrap text-[0.7rem] uppercase tracking-wider text-primary">
                    {sel.tag}
                  </span>
                </div>
                <p className="mt-1 text-base italic text-primary">{sel.pron}</p>
                <p className="mt-4 text-lg leading-relaxed opacity-95">{sel.def}</p>
                <div className="divider my-4" />
                <div className="font-zh">
                  <p className="text-2xl">
                    {sel.zhName}
                    <span className="ml-2 font-sans text-sm opacity-80">{sel.zhPinyin}</span>
                  </p>
                  <p className="mt-2 text-base leading-relaxed opacity-90">{sel.zhDef}</p>
                </div>
              </div>
            </>
          )}
        </div>
        <button className="modal-backdrop" onClick={() => setSelected(null)} aria-label="Close">
          close
        </button>
      </dialog>

      {/* ---------- Full-screen image viewer (yet-another-react-lightbox) ---------- */}
      <Lightbox
        open={!!sel && lbIndex >= 0}
        index={lbIndex < 0 ? 0 : lbIndex}
        close={() => setLbIndex(-1)}
        slides={slides}
        plugins={[Thumbnails, Captions, Counter, Zoom, Fullscreen]}
        counter={{ container: { style: { top: "unset", bottom: 0 } } }}
        captions={{ descriptionTextAlign: "center", showToggle: true }}
        carousel={{ finite: slides.length <= 1 }}
      />
    </div>
  )
}

export default App
