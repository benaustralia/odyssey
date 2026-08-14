import { Map as MapIcon, Sailboat } from "lucide-react"
import { mapLinks } from "@/data/mapRoutes"
import { type Entry, artsOf, assetUrl, hasRealArt } from "@/lib/entries"
import { PronounceButton } from "./PronounceButton"

// Pure presentational render of one glossary entry — no hooks, no window/
// document access. That's load-bearing, not a style preference: this exact
// component is rendered twice, once by the live browser (EntryPage.tsx) and
// once by scripts/prerender.tsx via react-dom/server's renderToStaticMarkup
// in a plain Node process, so it must produce identical markup in both.
//
// Map/Voyage links point at "/#<hash>" rather than setting
// window.location.hash directly (as the home-page cards do) — an entry page
// lives at a different path, so the link needs to navigate home first before
// the hash is meaningful.
export function EntryContent({ entry: e }: { entry: Entry }) {
  const arts = artsOf(e)
  const cover = arts[0]
  const { primary, journey } = mapLinks(e.term, e.tag === "place")
  const extraJourney = journey && primary?.kind !== "journey" ? journey : null
  const mapOnly = e.tag === "place" && !hasRealArt(e)

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <header className="border-b border-base-300 bg-base-100/90 px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <a href="/" className="font-display text-lg tracking-wide opacity-90 hover:opacity-100">
            The Odyssey — An Illustrated Glossary
          </a>
          <a href="/" className="btn btn-sm btn-ghost">
            ← All entries
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <article>
          {cover && (
            <figure className="mb-6 overflow-hidden rounded-box border border-base-300">
              <img
                src={assetUrl(cover)}
                alt={cover.title}
                width={1600}
                height={1200}
                className="w-full object-cover"
              />
            </figure>
          )}

          <div className="flex items-start justify-between gap-2">
            <h1 className="font-heading text-4xl font-semibold leading-none">{e.term}</h1>
            <span className="badge badge-outline badge-sm whitespace-nowrap text-[0.7rem] uppercase tracking-wider text-primary">
              {e.tag}
            </span>
          </div>
          <p className="mt-2 flex items-center gap-1 text-lg italic text-primary">
            {e.pron}
            <PronounceButton entry={e} />
          </p>

          <p className="mt-6 text-lg leading-relaxed opacity-95">{e.def}</p>

          <p lang="zh" className="mt-4 font-zh text-base leading-relaxed opacity-90">
            <span>{e.zhName}</span>
            <span className="px-1 text-primary">·</span>
            {e.zhDef}
          </p>

          {(primary || extraJourney) && (
            <div className="mt-8 flex flex-wrap gap-2">
              {primary && (
                <a href={`/#${primary.hash}`} className="btn btn-sm btn-outline gap-2">
                  {primary.kind === "journey" ? (
                    <Sailboat className="size-3.5" aria-hidden="true" />
                  ) : (
                    <MapIcon className="size-3.5" aria-hidden="true" />
                  )}
                  {mapOnly ? `View on ${primary.title}` : primary.kind === "journey" ? "Voyage" : "Map"}
                </a>
              )}
              {extraJourney && (
                <a href={`/#${extraJourney.hash}`} className="btn btn-sm btn-outline gap-2">
                  <Sailboat className="size-3.5" aria-hidden="true" />
                  Voyage
                </a>
              )}
            </div>
          )}

          {arts.length > 1 && (
            <p className="mt-8 text-sm opacity-70">
              <a href="/" className="link">
                See all {arts.length} artworks for {e.term} in the full glossary →
              </a>
            </p>
          )}
        </article>
      </main>
    </div>
  )
}
