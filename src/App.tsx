import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import glossaryData from "@/data/glossary.json"
import artData from "@/data/art.json"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
    <div className="min-h-screen">
      {/* ---------- Hero ---------- */}
      <header className="relative overflow-hidden border-b border-border">
        <img
          src="/art/sirens.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-[center_30%] opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center sm:py-32">
          <p className="font-display text-sm tracking-[0.55em] text-primary/90 sm:text-base">
            ΟΔΥΣΣΕΙΑ
          </p>
          <h1 className="mt-5 font-display text-5xl font-semibold tracking-tight text-foreground sm:text-7xl">
            The Odyssey
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-heading text-xl italic text-muted-foreground sm:text-2xl">
            An illustrated glossary of gods, mortals, monsters &amp; marvels &mdash;
            paired with the masterworks they inspired.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-sans text-sm text-muted-foreground/80">
            <span>Emily Wilson translation</span>
            <span className="text-primary/60">&bull;</span>
            <span>English</span>
            <span className="text-primary/60">&bull;</span>
            <span className="font-zh">简体中文</span>
            <span className="text-primary/60">&bull;</span>
            <span>Pīnyīn</span>
          </div>
        </div>
      </header>

      {/* ---------- Toolbar ---------- */}
      <div className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search names, meanings, pinyin…"
              className="pl-9 font-sans"
            />
          </div>
          <ToggleGroup
            type="single"
            value={cat}
            onValueChange={(v) => v && setCat(v)}
            variant="outline"
            className="flex-wrap justify-start lg:justify-end"
          >
            {CATEGORIES.map((c) => (
              <ToggleGroupItem
                key={c.id}
                value={c.id}
                className="font-sans data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                {c.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      {/* ---------- Gallery ---------- */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        <p className="mb-6 font-sans text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        </p>

        {filtered.length === 0 ? (
          <p className="py-24 text-center font-heading text-2xl italic text-muted-foreground">
            Nothing found on these shores.
          </p>
        ) : (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
            {filtered.map((e) => {
              const meta = e.art ? art[e.art] : undefined
              return (
                <Card
                  key={e.term}
                  onClick={() => setSelected(e)}
                  className="group block w-full cursor-pointer gap-0 overflow-hidden border-border bg-card/70 py-0 pb-5 transition-all duration-300 hover:border-primary/45 hover:shadow-[0_8px_40px_-12px] hover:shadow-primary/25"
                >
                  {meta && (
                    <div className="overflow-hidden">
                      <img
                        src={meta.file}
                        alt={meta.title}
                        loading="lazy"
                        className="w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
                      />
                    </div>
                  )}
                  <CardHeader className={meta ? "pt-5" : "pt-6"}>
                    <CardTitle className="font-heading text-3xl font-semibold leading-none text-foreground">
                      {e.term}
                    </CardTitle>
                    <CardDescription className="font-sans text-sm italic text-primary/80">
                      {e.pron}
                    </CardDescription>
                    <CardAction>
                      <Badge
                        variant="outline"
                        className="border-primary/30 font-sans text-[0.7rem] uppercase tracking-wider text-primary/90"
                      >
                        {e.tag}
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <p className="font-sans text-[0.95rem] leading-relaxed text-foreground/85">
                      {e.def}
                    </p>
                    <p className="mt-3 font-zh text-sm leading-relaxed text-muted-foreground">
                      <span className="text-foreground/90">{e.zhName}</span>
                      <span className="px-1 text-primary/70">·</span>
                      {e.zhDef}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-10 text-center font-sans text-sm text-muted-foreground">
          <p className="font-display tracking-[0.3em] text-primary/80">FINIS</p>
          <p className="mt-4">
            Definitions from a study glossary for <em>The Odyssey</em>, trans. Emily Wilson (W.&nbsp;W.&nbsp;Norton).
          </p>
          <p className="mt-1">
            Artworks are in the public domain, sourced via Wikimedia Commons. Built with React, Vite &amp; shadcn/ui.
          </p>
        </div>
      </footer>

      {/* ---------- Detail dialog ---------- */}
      <Dialog open={!!sel} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-3xl">
          {sel && (
            <>
              {selArt && (
                <figure className="border-b border-border bg-black/30">
                  <img
                    src={selArt.file}
                    alt={selArt.title}
                    className="max-h-[55vh] w-full object-contain"
                  />
                  <figcaption className="px-6 py-3 font-sans text-xs text-muted-foreground">
                    <span className="text-foreground/90">{selArt.artist}</span>,{" "}
                    <em>{selArt.title}</em>
                    {selArt.year ? `, ${selArt.year}` : ""}.{" "}
                    <a
                      href={selArt.source}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary/80 underline-offset-2 hover:underline"
                    >
                      Public domain · Wikimedia Commons
                    </a>
                  </figcaption>
                </figure>
              )}
              <div className="p-6">
                <DialogHeader>
                  <div className="flex items-baseline justify-between gap-4">
                    <DialogTitle className="font-heading text-4xl font-semibold text-foreground">
                      {sel.term}
                    </DialogTitle>
                    <Badge
                      variant="outline"
                      className="border-primary/30 font-sans text-[0.7rem] uppercase tracking-wider text-primary/90"
                    >
                      {sel.tag}
                    </Badge>
                  </div>
                  <DialogDescription className="font-sans text-base italic text-primary/80">
                    {sel.pron}
                  </DialogDescription>
                </DialogHeader>

                <p className="mt-4 font-sans text-lg leading-relaxed text-foreground/90">
                  {sel.def}
                </p>

                <Separator className="my-5 bg-border" />

                <div className="font-zh">
                  <p className="text-2xl text-foreground">
                    {sel.zhName}
                    <span className="ml-2 font-sans text-sm not-italic text-muted-foreground">
                      {sel.zhPinyin}
                    </span>
                  </p>
                  <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                    {sel.zhDef}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default App
