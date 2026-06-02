import { useMemo, useState } from "react"
import { Search, Palette } from "lucide-react"
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
  art?: string
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

function App() {
  const [query, setQuery] = useState("")
  const [cat, setCat] = useState("all")
  const [selected, setSelected] = useState<Entry | null>(null)

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
  const selArt = sel?.art ? art[sel.art] : undefined

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      {/* ---------- Hero ---------- */}
      <div
        className="hero min-h-[68vh]"
        style={{
          backgroundImage: "url(/art/sirens.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center 28%",
        }}
      >
        <div className="hero-overlay bg-base-100/75" />
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <p className="font-display text-sm tracking-[0.5em] text-primary sm:text-base">
              ΟΔΥΣΣΕΙΑ
            </p>
            <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight sm:text-7xl">
              The Odyssey
            </h1>
            <p className="mt-5 font-heading text-xl italic opacity-80 sm:text-2xl">
              An illustrated glossary of gods, mortals, monsters &amp; marvels &mdash;
              paired with the masterworks they inspired.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm opacity-70">
              <span>Emily Wilson translation</span>
              <span className="text-primary">&bull;</span>
              <span>English</span>
              <span className="text-primary">&bull;</span>
              <span className="font-zh">简体中文</span>
              <span className="text-primary">&bull;</span>
              <span>Pīnyīn</span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Toolbar ---------- */}
      <div className="sticky top-0 z-30 border-b border-base-300 bg-base-100/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="input input-bordered flex items-center gap-2 lg:max-w-xs">
            <Search className="size-4 opacity-60" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search names, meanings, pinyin…"
              className="grow"
            />
          </label>

          <div className="flex items-center gap-2">
            <div role="tablist" className="tabs tabs-box bg-base-200">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  role="tab"
                  onClick={() => setCat(c.id)}
                  className={`tab ${cat === c.id ? "tab-active" : ""}`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Official DaisyUI theme-controller */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-sm" aria-label="Theme">
                <Palette className="size-4" />
              </div>
              <ul
                tabIndex={0}
                className="menu dropdown-content z-40 mt-2 w-40 rounded-box bg-base-200 p-2 shadow-lg"
              >
                <li className="menu-title text-xs">Theme</li>
                <li>
                  <input
                    type="radio"
                    name="theme-dropdown"
                    className="theme-controller btn btn-ghost btn-sm justify-start"
                    aria-label="Coffee"
                    value="coffee"
                    defaultChecked
                  />
                </li>
                <li>
                  <input
                    type="radio"
                    name="theme-dropdown"
                    className="theme-controller btn btn-ghost btn-sm justify-start"
                    aria-label="Dracula"
                    value="dracula"
                  />
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Gallery ---------- */}
      <main className="mx-auto max-w-6xl px-4 py-10">
        <p className="mb-6 text-sm opacity-60">
          {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        </p>

        {filtered.length === 0 ? (
          <p className="py-24 text-center font-heading text-2xl italic opacity-60">
            Nothing found on these shores.
          </p>
        ) : (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
            {filtered.map((e) => {
              const meta = e.art ? art[e.art] : undefined
              return (
                <div
                  key={e.term}
                  onClick={() => setSelected(e)}
                  className="card card-border block w-full cursor-pointer overflow-hidden border-base-300 bg-base-200 shadow-md transition-shadow duration-300 hover:shadow-xl"
                >
                  {meta && (
                    <figure className="overflow-hidden">
                      <img
                        src={meta.file}
                        alt={meta.title}
                        loading="lazy"
                        className="w-full object-cover transition-transform duration-[1200ms] ease-out hover:scale-[1.05]"
                      />
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
                    <p className="text-[0.95rem] leading-relaxed opacity-90">{e.def}</p>
                    <p className="mt-1 font-zh text-sm leading-relaxed opacity-75">
                      <span className="opacity-100">{e.zhName}</span>
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
          <p className="mt-2 text-sm opacity-80">
            Definitions from a study glossary for <em>The Odyssey</em>, trans. Emily Wilson
            (W.&nbsp;W.&nbsp;Norton).
          </p>
          <p className="text-sm opacity-60">
            Artworks are in the public domain, via Wikimedia Commons. Built with React, Vite
            &amp; DaisyUI.
          </p>
        </aside>
      </footer>

      {/* ---------- Detail modal (DaisyUI) ---------- */}
      <dialog className={`modal ${sel ? "modal-open" : ""}`}>
        <div className="modal-box max-w-3xl p-0">
          {sel && (
            <>
              <button
                onClick={() => setSelected(null)}
                className="btn btn-circle btn-sm absolute right-3 top-3 z-10"
                aria-label="Close"
              >
                ✕
              </button>
              {selArt && (
                <figure className="border-b border-base-300 bg-black/30">
                  <img
                    src={selArt.file}
                    alt={selArt.title}
                    className="max-h-[55vh] w-full object-contain"
                  />
                  <figcaption className="px-6 py-3 text-xs opacity-70">
                    <span className="opacity-100">{selArt.artist}</span>, <em>{selArt.title}</em>
                    {selArt.year ? `, ${selArt.year}` : ""}.{" "}
                    <a
                      href={selArt.source}
                      target="_blank"
                      rel="noreferrer"
                      className="link link-primary"
                    >
                      Public domain · Wikimedia Commons
                    </a>
                  </figcaption>
                </figure>
              )}
              <div className="p-6">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-heading text-4xl font-semibold">{sel.term}</h3>
                  <span className="badge badge-outline whitespace-nowrap text-[0.7rem] uppercase tracking-wider text-primary">
                    {sel.tag}
                  </span>
                </div>
                <p className="mt-1 text-base italic text-primary">{sel.pron}</p>
                <p className="mt-4 text-lg leading-relaxed opacity-90">{sel.def}</p>
                <div className="divider my-4" />
                <div className="font-zh">
                  <p className="text-2xl">
                    {sel.zhName}
                    <span className="ml-2 font-sans text-sm opacity-60">{sel.zhPinyin}</span>
                  </p>
                  <p className="mt-2 text-base leading-relaxed opacity-75">{sel.zhDef}</p>
                </div>
              </div>
            </>
          )}
        </div>
        <button
          className="modal-backdrop"
          onClick={() => setSelected(null)}
          aria-label="Close"
        >
          close
        </button>
      </dialog>
    </div>
  )
}

export default App
