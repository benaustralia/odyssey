import { lazy, Suspense, useEffect, useMemo, useState } from "react"
import { Search, Map as MapIcon, Sailboat, Heart } from "lucide-react"
import { PronounceButton } from "./PronounceButton"
import { SupportModal } from "./SupportModal"

// Leaflet is heavy and the map is opt-in, so load it only when first opened.
const JourneyMap = lazy(() => import("./JourneyMap"))
const AtlasMap = lazy(() => import("./AtlasMap"))
import JourneysIndex from "./JourneysIndex"
import Lightbox from "yet-another-react-lightbox"
import Captions from "yet-another-react-lightbox/plugins/captions"
import Download from "yet-another-react-lightbox/plugins/download"
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen"
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import "yet-another-react-lightbox/styles.css"
import "yet-another-react-lightbox/plugins/captions.css"
import "yet-another-react-lightbox/plugins/counter.css"
import "yet-another-react-lightbox/plugins/thumbnails.css"
import { JOURNEYS, DEFAULT_JOURNEY_SLUG, findStop } from "@/data/journeys"
import { PLATES, DEFAULT_PLATE_SLUG, findPin, latinFor } from "@/data/plates"
// Journey-vs-Atlas routing policy for a term, shared with the Atlas's own
// header search so a place never routes two different ways.
import { mapLinks, type MapRoute } from "@/data/mapRoutes"
import {
  type Entry,
  entries,
  byTerm,
  assetUrl,
  coverThumbUrl,
  artsOf,
  hasRealArt,
  categoryOf,
} from "@/lib/entries"
import { slugify } from "@/lib/slug"

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "gods", label: "Gods" },
  { id: "mortals", label: "Mortals" },
  { id: "monsters", label: "Monsters" },
  { id: "world", label: "World" },
]

// A card's small map affordance. stopPropagation matters: the card itself is a
// role="button" whose click opens the gallery, and this sits inside it.
function MapLink({ term, route }: { term: string; route: MapRoute }) {
  const Icon = route.kind === "journey" ? Sailboat : MapIcon
  return (
    <button
      type="button"
      className="btn btn-xs btn-ghost gap-1 px-1.5"
      title={`Show ${term} on ${route.title}`}
      onClick={(ev) => {
        ev.stopPropagation()
        window.location.hash = route.hash
      }}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {route.kind === "journey" ? "Voyage" : "Map"}
    </button>
  )
}

function App() {
  const [query, setQuery] = useState("")
  const [cat, setCat] = useState("all")
  const [selected, setSelected] = useState<Entry | null>(null)
  const [lbIndex, setLbIndex] = useState(-1) // >=0 => lightbox open at that slide
  // The Stripe support modal: one shared open flag for all three entry
  // points (nav button, end-of-glossary card, footer link) — a modal
  // rather than a scroll-to-anchor card, matching how JourneyMap/AtlasMap/
  // the Lightbox already open on this site, and sidestepping scroll-into-
  // view (and its page-length/DOM-commit-timing traps) entirely.
  const [supportOpen, setSupportOpen] = useState(false)
  const openSupport = () => setSupportOpen(true)
  const closeSupport = () => setSupportOpen(false)
  // Stripe's Payment Link redirects back here with ?donated=true after a
  // successful checkout (see SupportModal's after_completion config). The
  // query param is stripped immediately so a refresh/share of the URL
  // doesn't re-show the banner; the banner then self-dismisses.
  const [donationThanks, setDonationThanks] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("donated") === "true",
  )
  useEffect(() => {
    if (!donationThanks) return
    window.history.replaceState(null, "", window.location.pathname + window.location.hash)
    const t = setTimeout(() => setDonationThanks(false), 6000)
    return () => clearTimeout(t)
  }, [donationThanks])
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
  // Journey routes resolve their "@term" the way atlas routes do, with one
  // extra step: findStop also reads the place->stop alias table, so
  // "#journey/@Aeaea" lands on the stop whose canonical term is "Circe".
  // The route always carries the STOP's term, which is what JourneyMap matches.
  const parseJourneyHash = (
    hash: string,
  ): { slug: string; eyeball: boolean; focusTerm?: string } | null => {
    const route = parseMapHash(hash, "journey", JOURNEYS, DEFAULT_JOURNEY_SLUG)
    if (!route) return null
    const { focusRaw } = splitFocus(hash)
    if (!focusRaw) return route
    const hit = findStop(focusRaw, route.slug)
    if (!hit) return route
    return { slug: hit.slug, eyeball: route.eyeball, focusTerm: hit.stop.term }
  }
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
  // "#journeys" (plural) — a landing grid of every registered journey,
  // distinct from "#journey"/"#journey/<slug>" (a specific voyage). Exact
  // string equality, not parseMapHash, since it isn't a per-journey route.
  const [journeysIndexOpen, setJourneysIndexOpen] = useState(
    () => (typeof window !== "undefined" ? window.location.hash === "#journeys" : false),
  )
  useEffect(() => {
    const sync = () => {
      setJourneyRoute(parseJourneyHash(window.location.hash))
      setAtlasRoute(parseAtlasHash(window.location.hash))
      setJourneysIndexOpen(window.location.hash === "#journeys")
    }
    window.addEventListener("hashchange", sync)
    return () => window.removeEventListener("hashchange", sync)
  }, [])
  const openMap = (slug: string = DEFAULT_JOURNEY_SLUG) => {
    window.location.hash = slug === DEFAULT_JOURNEY_SLUG ? "journey" : `journey/${slug}`
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
  const openJourneysIndex = () => {
    window.location.hash = "journeys"
  }
  const closeJourneysIndex = () => {
    setJourneysIndexOpen(false)
    if (window.location.hash === "#journeys")
      window.history.replaceState(null, "", window.location.pathname + window.location.search)
  }

  // Esc closes whichever full-screen map is open. Skipped while the lightbox
  // is showing on top of a map — that's YARL's own Escape-to-close, and it
  // should close just the lightbox, not the map underneath it too.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || (selected && lbIndex >= 0)) return
      if (journeyRoute) closeMap()
      else if (atlasRoute) closeAtlas()
      else if (journeysIndexOpen) closeJourneysIndex()
      else if (supportOpen) closeSupport()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [journeyRoute, atlasRoute, journeysIndexOpen, supportOpen, selected, lbIndex])

  // A journey-map pin → open that term's entry in the lightbox. The map stays
  // open underneath, so closing the lightbox returns to the map.
  const openTerm = (term: string) => {
    const e = byTerm.get(term)
    if (!e) return
    setSelected(e)
    setLbIndex(0)
  }

  const filtered = useMemo(() => {
    const raw = query.trim()
    const q = raw.toLowerCase()
    // Rank name matches above matches buried in a definition — searching
    // "Circe" must put Circe first, not Aeaea (whose def mentions her).
    // Ties keep the underlying alphabetical order (sort is stable).
    const rank = (e: Entry) => {
      const t = e.term.toLowerCase()
      if (t === q) return 0
      if (t.startsWith(q)) return 1
      if (t.includes(q) || e.zhName.includes(raw) || e.zhPinyin.toLowerCase().startsWith(q))
        return 2
      return 3
    }
    const hits = entries.filter((e) => {
      const inCat = cat === "all" || categoryOf(e.tag) === cat
      if (!inCat) return false
      if (!q) return true
      return (
        e.term.toLowerCase().includes(q) ||
        e.def.toLowerCase().includes(q) ||
        e.zhPinyin.toLowerCase().includes(q) ||
        e.zhName.includes(raw) ||
        e.tag.toLowerCase().includes(q)
      )
    })
    return q ? hits.slice().sort((a, b) => rank(a) - rank(b)) : hits
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
    // Download filename: "Artist — Title.jpg" when known, else the R2 file's
    // own basename ("odysseus-1.jpg"). Without this the blob save falls back
    // to an opaque browser-generated name.
    const downloadFilename = (
      [a.artist, a.title].filter(Boolean).join(" — ") ||
      a.file.split("/").pop()?.replace(/\.jpe?g$/i, "") ||
      "artwork"
    ).replace(/[/\\:*?"<>|]/g, "") + ".jpg"
    // downloadUrl carries a throwaway query param so it never shares a
    // browser-cache key with the <img> load: the slide image is fetched
    // no-cors (no Access-Control-Allow-Origin on that cached response, and
    // R2 omits Vary on it), so reusing it for the download's CORS fetch
    // fails and the plugin silently degrades to open-in-new-tab.
    return { src: assetUrl(a), description, downloadFilename, downloadUrl: `${assetUrl(a)}?download` }
  })

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      {donationThanks && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success shadow-lg">
            <Heart className="size-4" aria-hidden="true" />
            <span>
              <span lang="en">Thank you for your support!</span>{" "}
              <span lang="zh" className="font-zh">感谢你的支持！</span>
            </span>
          </div>
        </div>
      )}
      {/* ---------- Hero ---------- */}
      <header className="hero relative overflow-hidden sm:min-h-[68vh]">
        {/* hero-blur.avif is hero.jpg with the old 3px backdrop-blur AND
            the flat base-100/72 overlay BAKED IN (blur + overlay leave so
            little entropy it encodes to ~2KB vs 101KB). That deletes the
            runtime backdrop-filter layer — a real compositing cost on
            mobile GPUs — and Chrome's low-entropy heuristic drops this img
            from LCP candidacy, making the first voyage-carousel slide the
            LCP element instead (it's eager + preloaded for exactly that
            reason). The bottom gradient stays a live overlay because it's
            viewport-relative — baking it into image space would misalign
            under object-cover crops on wide screens. hero.jpg itself stays
            in public/ for og:image (scripts/prerender.tsx). */}
        <img
          src="/hero-blur.avif"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          width={1000}
          height={825}
          className="absolute inset-0 h-full w-full object-cover object-[center_28%]"
        />
        <div className="hero-overlay bg-gradient-to-b from-base-100/30 via-base-100/55 to-base-100" />
        <div className="hero-content py-8 text-center">
          <div className="max-w-2xl lg:max-w-4xl">
            <p className="font-display text-sm tracking-[0.5em] text-primary sm:text-base">
              ΟΔΥΣΣΕΙΑ
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:mt-4 sm:text-7xl">
              The Odyssey
            </h1>
            <p className="mt-3 font-heading text-lg italic opacity-90 sm:mt-5 sm:text-2xl">
              An illustrated glossary.
            </p>
            {/* The voyages, offered as pictures rather than menu items: a
                swipeable DaisyUI carousel (native CSS scroll-snap, no JS
                needed for the swipe itself), one slide per registered
                journey (JOURNEYS) so a third voyage just needs a
                JourneyConfig entry, no markup changes here. The FIRST slide
                is eager + high-priority + preloaded from index.html: since
                the baked hero-blur.avif is too low-entropy to be an LCP
                candidate, this in-viewport map crop IS the LCP element.
                Later slides stay lazy. Dot nav below uses scrollIntoView
                on the slide's own id rather than <a href="#..."> — an
                anchor would rewrite window.location.hash and misfire this
                app's own hash-based map routing. behavior:"instant", not
                "smooth": a JS-driven smooth scrollIntoView on a
                scroll-snap-mandatory container is prone to Chromium
                silently dropping the animation (raced against the
                snap-point re-evaluation) — confirmed via manual testing:
                a real swipe/native scroll always worked, but a smooth
                scrollIntoView to the last slide intermittently no-opped.
                Instant sidesteps the race entirely; swiping still glides
                via the browser's own native momentum scroll. */}
            <div className="carousel mx-auto mt-5 w-full max-w-md rounded-box sm:mt-8 sm:max-w-lg lg:max-w-2xl xl:max-w-3xl">
              {Object.values(JOURNEYS).map((j, slideIndex) => (
                <div key={j.slug} id={`hero-slide-${j.slug}`} className="carousel-item w-full">
                  <button
                    type="button"
                    onClick={() => openMap(j.slug)}
                    className="group block w-full overflow-hidden border border-base-300 bg-base-100/70 shadow-lg backdrop-blur transition-shadow duration-300 hover:shadow-2xl"
                  >
                    <img
                      src={j.heroImage}
                      alt={j.heroAlt}
                      loading={slideIndex === 0 ? "eager" : "lazy"}
                      fetchPriority={slideIndex === 0 ? "high" : undefined}
                      decoding="async"
                      width={900}
                      height={419}
                      className="w-full transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                    />
                    <span className="flex items-center justify-center gap-2 px-3 py-2 font-heading text-sm sm:text-base">
                      <Sailboat className="size-4 text-primary" aria-hidden="true" />
                      {j.heroCta}
                      <span className="text-primary transition-transform group-hover:translate-x-0.5">→</span>
                    </span>
                  </button>
                </div>
              ))}
            </div>
            {Object.keys(JOURNEYS).length > 1 && (
              <div className="mt-2 flex w-full items-center justify-center gap-2">
                {Object.values(JOURNEYS).map((j) => (
                  <button
                    key={j.slug}
                    type="button"
                    aria-label={`Show ${j.title}`}
                    onClick={() =>
                      document
                        .getElementById(`hero-slide-${j.slug}`)
                        ?.scrollIntoView({ behavior: "instant", inline: "start", block: "nearest" })
                    }
                    className="btn btn-circle btn-ghost btn-sm text-[8px] text-primary"
                  >
                    ●
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ---------- Toolbar ---------- */}
      <nav className="sticky top-0 z-30 border-b border-base-300 bg-base-100/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          {/* On mobile the two map buttons ride the search row as icon-only
              squares (full-width stacked buttons pushed the cards below the
              fold); at lg they hide and the labeled pair at the end of the
              toolbar shows instead. */}
          <div className="flex w-full items-center gap-2 lg:contents">
            <label className="input input-bordered flex min-w-0 grow items-center gap-2 lg:w-full lg:max-w-xs">
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
            <button
              type="button"
              onClick={openJourneysIndex}
              className="btn btn-square btn-outline lg:hidden"
              aria-label="Journey Maps"
            >
              <Sailboat className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={openAtlas}
              className="btn btn-square btn-outline lg:hidden"
              aria-label="Atlas"
            >
              <MapIcon className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={openSupport}
              className="btn btn-square btn-primary lg:hidden"
              aria-label="Donate · 捐助"
              title="Open the support panel"
            >
              <Heart className="size-4" aria-hidden="true" />
            </button>
          </div>

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
            onClick={openJourneysIndex}
            className="btn btn-md btn-outline hidden gap-2 lg:inline-flex"
          >
            <Sailboat className="size-4" aria-hidden="true" />
            Journey Maps
          </button>
          <button
            type="button"
            onClick={openAtlas}
            className="btn btn-md btn-outline hidden gap-2 lg:inline-flex"
          >
            <MapIcon className="size-4" aria-hidden="true" />
            Atlas
          </button>
          <button
            type="button"
            onClick={openSupport}
            className="btn btn-md btn-primary hidden gap-2 lg:inline-flex"
            title="Open the support panel"
          >
            <Heart className="size-4" aria-hidden="true" />
            Donate <span lang="zh" className="font-zh">捐助</span>
          </button>
        </div>
      </nav>

      <JourneysIndex open={journeysIndexOpen} onClose={closeJourneysIndex} onOpenJourney={openMap} />
      <SupportModal open={supportOpen} onClose={closeSupport} />

      {journeyRoute && (
        <Suspense fallback={null}>
          <JourneyMap
            key={journeyRoute.slug}
            config={JOURNEYS[journeyRoute.slug]}
            open
            editing={journeyRoute.eyeball}
            focusTerm={journeyRoute.focusTerm}
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
            lookup={(t) => byTerm.get(t)}
          />
        </Suspense>
      )}

      {/* ---------- Gallery ---------- */}
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex items-baseline gap-3">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">Glossary</h2>
          <span className="font-heading text-sm italic opacity-60">
            {filtered.length === entries.length
              ? `${entries.length} entries`
              : `${filtered.length} of ${entries.length}`}
          </span>
        </div>
        {filtered.length === 0 ? (
          <p className="py-24 text-center font-heading text-2xl italic opacity-80">
            Nothing found on these shores.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e) => {
              const arts = artsOf(e)
              const cover = arts[0]
              // `primary` is the one map this term belongs on (mapRoutes
              // decides Journey vs Atlas); `journey` is the voyage link when
              // that ISN'T the primary — Troy and Ithaca are on Ortelius's
              // real Greek plate, but they're also stops 1 and 15, so they
              // offer both. Map-only places open their primary map on
              // whole-card click; everything else keeps gallery-first click
              // and shows the links as small buttons.
              // The engraved Ortelius toponym for the place's owning pin
              // ("Knossos (Cnodos)") — findPin picks the same plate the
              // card's map link opens, so heading and destination agree.
              const pin = e.tag === "place" ? findPin(e.term) : null
              const latin = pin ? latinFor(pin.place) : null
              const { primary, journey } = mapLinks(e.term, e.tag === "place")
              const cardOpensMap = !!primary && e.tag === "place" && !hasRealArt(e)
              const extraJourney = journey && primary?.kind !== "journey" ? journey : null
              const openGallery = () => {
                setSelected(e)
                setLbIndex(0)
              }
              const openCard = () => {
                if (cardOpensMap && primary) window.location.hash = primary.hash
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
                  // content-visibility:auto lets the browser skip style/
                  // layout/paint for offscreen cards (~90% of a 3,700-element
                  // DOM) — measured ~1.3s of pre-paint layout work on mobile
                  // before this (Plan.md chase-100 session #2). The
                  // contain-intrinsic-size estimate (~cover 284px + body)
                  // reserves scroll height until a card first renders.
                  className="card card-border flex h-full w-full cursor-pointer flex-col overflow-hidden border-base-300 bg-base-200 text-left shadow-md transition-shadow duration-300 hover:shadow-xl [content-visibility:auto] [contain-intrinsic-size:auto_470px]"
                >
                  {cover && (
                    <figure className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={coverThumbUrl(cover)}
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
                        {/* One nested span so the heading + bracket wrap as
                            normal text — card-title is a flex row, and two
                            loose children would gap/align as flex items. The
                            term itself is a real permalink to /entry/<slug>
                            (stopPropagation so it doesn't also fire the
                            card's own gallery/map click) — this is what
                            makes the crawlable link graph connect the home
                            page to every entry page, not just the sitemap. */}
                        <span>
                          <a
                            href={`/entry/${slugify(e.term)}`}
                            onClick={(ev) => ev.stopPropagation()}
                            className="text-inherit hover:underline"
                          >
                            {e.term}
                          </a>
                          {latin && (
                            <span className="text-xl font-normal italic opacity-70"> ({latin})</span>
                          )}
                        </span>
                      </h2>
                      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                        {primary && !cardOpensMap && <MapLink term={e.term} route={primary} />}
                        {extraJourney && <MapLink term={e.term} route={extraJourney} />}
                        <span className="badge badge-outline badge-sm whitespace-nowrap text-[0.7rem] uppercase tracking-wider text-primary">
                          {e.tag}
                        </span>
                      </div>
                    </div>
                    <p className="flex items-center gap-1 text-sm italic text-primary">
                      {e.pron}
                      <PronounceButton entry={e} />
                    </p>
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

        <div className="mt-12">
          <div className="card mx-auto max-w-xl border border-base-300 bg-base-200 shadow-sm">
            <div className="card-body items-center text-center">
              <Heart className="size-6 text-primary" aria-hidden="true" />
              <h2 lang="en" className="font-heading text-2xl font-semibold">
                Support this project
              </h2>
              <h2 lang="zh" className="font-zh text-xl font-semibold opacity-90">
                支持这个项目
              </h2>
              <p lang="en" className="mt-2 max-w-md leading-relaxed opacity-90">
                Tell Me, O Muse is free and always will be. If it has been useful to you, a
                one-off or monthly contribution helps cover hosting and the time spent researching
                entries.
              </p>
              <p lang="zh" className="font-zh mt-1 max-w-md leading-relaxed opacity-90">
                《Tell Me, O Muse》始终免费开放。如果它对你有帮助，欢迎一次性捐助或按月支持，用于分担网站运行费用与词条研究的时间成本。
              </p>
              <button type="button" className="btn btn-primary mt-4" onClick={openSupport}>
                Donate <span lang="zh" className="font-zh">· 捐助</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="footer footer-center border-t border-base-300 bg-base-200 p-10 text-base-content">
        <aside className="max-w-2xl">
          <p className="font-display tracking-[0.3em] text-primary">FINIS</p>
          <p className="mt-2 text-sm opacity-80">
            Artworks are public domain or openly licensed (CC), via Wikimedia Commons. Built with
            React, Vite, DaisyUI &amp; yet-another-react-lightbox.
          </p>
          <p className="mt-2 text-sm opacity-80">
            <button type="button" onClick={openSupport} className="link link-hover">
              <span lang="en">Support this project</span>{" "}
              <span lang="zh" className="font-zh">
                · 支持这个项目
              </span>
            </button>
          </p>
          <p className="mt-2 text-sm opacity-80">
            © 2026 Ben Hinton ·{" "}
            <a className="link link-hover" href="mailto:bahinton@gmail.com?subject=Via%20tellmeohmuse.com">
              bahinton@gmail.com
            </a>{" "}
            ·{" "}
            <a className="link link-hover" href="https://github.com/benaustralia/odyssey" target="_blank" rel="noreferrer">
              GitHub
            </a>
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
        plugins={[Thumbnails, Captions, Zoom, Fullscreen, Download]}
        captions={{ descriptionTextAlign: "center", descriptionMaxLines: 5, showToggle: true }}
        carousel={{ finite: slides.length <= 1 }}
      />
    </div>
  )
}

export default App
