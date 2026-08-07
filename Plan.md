# Plan: Crawlable per-entry pages + near-term content roadmap (approved 2026-08-07)

> Supersedes the previous contents of this file (the place→map deep-link plan, approved
> 2026-08-07, all phases applied). That plan's full history is preserved in git log and in
> `CLAUDE.md`'s TODO 0 / "Done (context)" section — nothing is lost, this file just now tracks
> the next initiative, per this repo's own convention of using `Plan.md` for whichever
> multi-phase effort is active.

## Why
The site is entirely client-rendered: `index.html` ships an empty `<div id="root">` and all 167
glossary entries arrive after JS runs. Confirmed by reading the actual shipped `index.html` and
`src/App.tsx` — there is no per-entry routing at all (not even client-side; only the two map
modals get hash routes), and `public/sitemap.xml` lists exactly one URL, the homepage. Google
renders JS slowly/unreliably for a new zero-authority domain; Baidu (needed for the Chinese half
of the audience) does not render JS at all. Net effect: 166 of 167 entries are functionally
invisible to search, and 100% of them are invisible to Baidu specifically.

Decision (user, 2026-08-07): fix this with the lighter option — keep Vite/React (no Next.js
rewrite, which would put the maps' custom Leaflet/CRS.Simple/lazy-load architecture at needless
risk) — add real per-entry URLs and prerender them to static HTML at build time.

**Timing note:** the user flagged there's a surge of interest in the Odyssey right now, and
specifically expects the Chinese-language audience's window of interest to run roughly **8 weeks**
from 2026-08-07 (~through early October 2026). That argues for shipping Phase 0 (and any Baidu
submission / indexing follow-through) promptly rather than treating this as background work —
and it's part of why the two open-ended, multi-month items below are parked rather than
scheduled: the user isn't sure they're worth it at all, particularly for an audience with a
near-term window rather than a multi-year one.

## Resume protocol — read this first
1. Read this whole file.
2. Take the first phase whose Status is ☐ (skip PARKED phases unless explicitly opted into).
3. Re-read the files that phase lists, implement only that phase, run its Verify steps.
4. Flip its Status to ✅, tick task boxes, append a line to the Status log at the bottom.
5. Commit (include this file so progress survives), push — `main` auto-deploys.

---

## Phase 0 — Per-entry routes + static prerendering + bilingual sitemap
**Status: ✅ (2026-08-07)**

Goal: every glossary entry gets a real, permanent, crawlable URL (`/entry/<slug>`) whose HTML —
with zero JS execution — already contains the English **and** Chinese (Simplified) text, so both
Google and Baidu can index it directly from the raw response.

Design (no new UI-routing dependency — `react-router-dom` isn't needed for a 2-shape site):
- `src/lib/slug.ts` — `slugify(term)` (kebab-case; verified no collisions across all 167 terms).
- `src/EntryContent.tsx` — **pure** presentational component, `(entry: Entry) => JSX`. No hooks,
  no `window`/`document` access, so it can run identically in the browser and in a plain Node/tsx
  script. Renders: term + Latin/Ortelius bracket (reuse `findPin`/`latinFor` for places), `pron`,
  tag badge, EN `def`, ZH `zhName`/`zhDef` (wrapped in `lang="zh"`), cover art `<img>`, Map/Voyage
  links (reuse `mapLinks` — these must be plain `<a href="/#...">` since the entry page lives at a
  different path than the maps' hash routes), and a link back to `/`.
- `src/EntryPage.tsx` — thin client wrapper: takes `slug` prop, looks up the entry, renders
  `<EntryContent>`, handles the not-found case. Used only in the live SPA (client nav / direct
  load), not by the prerender script.
- `src/main.tsx` — dispatch on `window.location.pathname` at boot: `/entry/<slug>` → mount
  `EntryPage`, everything else → mount the existing `App` unchanged. No router library, no
  changes to `App.tsx`'s internals (maps, hash routing, calibration mode all untouched).
- `src/App.tsx` grid cards — wrap the term heading in a real `<a href="/entry/<slug>">`
  (`stopPropagation` so the card's existing click-to-gallery/click-to-map behavior is unaffected)
  so the link graph actually connects home → each entry, not just the sitemap.
- `scripts/prerender.tsx` (run via the already-present `tsx`, **no headless-browser dependency**
  — `EntryContent` is pure, so this uses `react-dom/server`'s `renderToStaticMarkup` directly):
  for every entry, render the body HTML, splice it into a copy of the built `dist/index.html`
  (reusing its hashed `<script>`/`<link>` tags so client hydration/takeover still works), inject
  a per-entry `<title>`, bilingual `<meta name="description">`, and OG tags, write to
  `dist/entry/<slug>/index.html`.
- `scripts/sitemap.tsx` — regenerate `public/sitemap.xml`/`dist/sitemap.xml` listing `/` plus all
  167 `/entry/<slug>` URLs. (`robots.txt` already allows all and already points at the sitemap —
  no change needed there.)
- `package.json` — `"build": "tsc -b && vite build && tsx scripts/prerender.tsx && tsx scripts/sitemap.tsx"`.
- Vercel: confirm no rewrite/config is needed (static files at matching paths should serve
  directly under the zero-config Vite preset); add a `vercel.json` only if testing shows
  otherwise.

Verify:
- `npm run build`, then `vite preview`.
- `curl -s http://localhost:<port>/entry/<some-place-slug>` — confirm the EN def, the ZH def, and
  a `<title>` reflecting that entry are present in the raw response with **no JS executed**
  (i.e. don't just check in a browser — curl or `fetch` with JS disabled).
- Spot-check a handful of entries in an actual browser: page loads, then the client bundle takes
  over cleanly (no hydration-mismatch console errors), card grid / maps / lightbox still work.
- `npm run check:pins` (unrelated but cheap — confirm this phase didn't touch plate data).
- Regenerate and eyeball `public/sitemap.xml` — 168 URLs.

---

## Phase 1 — Pronunciation audio (ElevenLabs)
**Status: ☐ (near-term, not yet scoped in detail)**

Every entry already has a text `pron` field (e.g. shown under the term on each card) — this adds
spoken audio on top, not a new pronunciation system.
- Reuse the ElevenLabs API key already set up in the sibling project `~/Documents/NAPLANSpelling`
  — **first step of this phase is locating exactly where that project stores it** (its own
  `.env`/`.env.local`) and confirming it's still valid before reusing it here.
- Voice: **standard British voice**, explicitly NOT the young-Australian voice used in
  `NAPLANSpelling`'s script — pick a specific ElevenLabs voice ID and record the choice here once
  decided (needs a short voice-sampling pass against the ElevenLabs API/voice library).
- Scope TBD when this phase starts: audio per glossary `term` only, or per `term` + one example
  usage; where files land (R2, same as art — `audio/<slug>.mp3`); a small play-button UI on the
  card and/or entry page.

---

## Phase 2 — Iconographic index
**Status: ☐ (near-term, not yet scoped in detail)**

"Every depiction of [episode], dated and sourced" — the site's existing art curation is most of
the way there already: `art.json` (492 deduped, licensed images with artist/title/year/source)
and each entry's `art[]` array already link art to subject. This phase is mostly a
presentation/query layer over data that already exists, not new sourcing.
- Open design question for when this phase starts: is "episode" a new concept in the data model
  (e.g. group entries like Sirens/Circe/Cyclops under a shared episode key), or does this reuse
  existing `tag`/entry groupings as-is? Needs a short design pass before implementation.

---

## Manual follow-ups (not code — no files to read, nothing to implement; tracked here so they don't get lost)
- [ ] **Submit the sitemap to Baidu's Ziyuan webmaster tools** (百度搜索资源平台,
  ziyuan.baidu.com). Phase 0 made every page on the site crawlable by a non-JS crawler and
  `public/sitemap.xml`/`https://odysseygloss.vercel.app/sitemap.xml` lists all 168 URLs, but
  Baidu still won't discover any of it without the site being registered/verified there and the
  sitemap submitted through that platform — this is the one remaining step between "code-side
  ready" and "actually indexed by Baidu." Needs the user's own Baidu account (site-ownership
  verification, typically a DNS TXT record or an uploaded HTML file) — not something to do from
  this repo alone. Given the ~8-week Chinese-audience window noted above, do this promptly once
  picked up.

---

## Parked / low-conviction (not scheduled — user is not sure these are worth doing at all)
- **Cross-translation line alignment** — mapping book/line numbers across Wilson, Fagles,
  Fitzgerald, Lattimore, Butler. Copyright-clean (line numbers only) but a real data-acquisition
  project on its own. Noted for later consideration only.
- **Full 24-book coverage** — reframes the site from a 167-entry glossary into a running
  commentary on the whole poem. Multi-month scope. Noted for later consideration only.

Both are explicitly *not* commitments — the user's stated reasoning (2026-08-07) is they aren't
sure these matter, especially for the Chinese-language audience, whose interest they expect to be
a ~8-week window rather than a long-term audience multi-month investments would be built for.
Don't treat either as "next up" without the user re-raising it.

---

## Status log
- 2026-08-07 — Plan created. User confirmed: proceed with Phase 0 now; Phase 1 (pronunciation
  audio) and Phase 2 (iconographic index) are next up after; cross-translation alignment and
  full-book coverage are explicitly parked/future-only.
- 2026-08-07 — **Phase 0 done.** No new npm dependencies — `EntryContent` is a pure component,
  so `scripts/prerender.tsx` renders it via `react-dom/server`'s `renderToStaticMarkup`, loaded
  through Vite's own SSR module graph (`vite.ssrLoadModule`) rather than a plain tsx/Node import,
  because its import chain (via `mapRoutes` → `data/journeys`) reaches `.svg` asset imports that
  plain Node can't load — Vite's dev pipeline resolves those the same way the client build does.
  Extracted `src/lib/entries.ts` (single source of truth for `entries`/`art`/`byTerm`/`bySlug`/
  `assetUrl`/`artsOf`/`hasRealArt`/`categoryOf`, previously duplicated only in `App.tsx`) and
  `src/lib/slug.ts` (`slugify`, verified zero collisions across all 167 terms) so the SPA, the
  prerender script, and the sitemap script all resolve a term the same way. `main.tsx` dispatches
  on `window.location.pathname` at boot (`/entry/<slug>` → `EntryPage`, else → the existing `App`
  unchanged) — no router library added, since a 2-shape site doesn't need one. Grid card term
  headings are now real `<a href="/entry/<slug>">` links (stopPropagation'd so the card's
  existing gallery/map click is unaffected), connecting the crawlable link graph from home to
  every entry, not just the sitemap. `scripts/sitemap.ts` writes all 168 URLs to both
  `public/sitemap.xml` and `dist/sitemap.xml` (the latter needed because `vite build` copies
  `public/` into `dist/` *before* this script runs).
  **Real bug caught during verification:** `vite preview`'s static server (sirv) falls back to
  serving the SPA shell for `/entry/<slug>` with no trailing slash — the client-side JS then
  masks it by rendering the right content anyway, so it LOOKS fine in a browser but a
  non-JS crawler hitting that exact URL form would see an empty shell. Added `vercel.json` with
  an explicit rewrite (`/entry/:slug` → `/entry/:slug/index.html`) so the actual deployed URLs
  (used by both our internal links and the sitemap, all written without a trailing slash) serve
  the real static file. **Not verifiable pre-deploy** — `vercel.json` rewrites aren't understood
  by `vite preview`, so this specific behavior needed a live spot-check.
  **Confirmed live, 2026-08-07** (commit `d171d3d`, deployed): the no-trailing-slash form
  correctly serves the prerendered bilingual page via the rewrite, the trailing-slash form and
  home page both still work, and the live sitemap serves all 168 URLs.
  Verified pre-deploy via `curl` (raw HTML has full bilingual content + correct title/meta/OG with zero JS)
  and in a real browser (console clean, existing card-click-to-gallery and card-click-to-map
  behavior unchanged, new term-link navigates correctly). `check:pins` clean; the 3 pre-existing
  `eslint` errors in `AtlasMap.tsx`/`JourneyMap.tsx` predate this work (confirmed via `git
  stash`) and are untouched by it.
  **Follow-up, not yet done:** submitting the sitemap to Baidu's own webmaster tools (Baidu
  Ziyuan) is a manual step outside this repo — code-side discoverability is done, but Baidu
  won't find it without that registration.
- 2026-08-07 — **Home page prerendered too** (commit `bdb34e1`), closing the one scope cut noted
  above. Empirically confirmed first (a throwaway probe script, deleted after) that `App()`
  itself renders cleanly via `renderToStaticMarkup` with no browser present — its only
  window-dependent state (the two map hash routes) already guards on `typeof window !==
  "undefined"`, so in Node it resolves to `null` and the Suspense-wrapped map modals just never
  attempt to render. No new component needed: `scripts/prerender.tsx` now also
  `ssrLoadModule`s `/src/App.tsx`, renders it, and overwrites `dist/index.html`'s `#root` with
  the default unfiltered 167-card grid (no per-page `<head>` rewrite needed — the static
  title/description were already the correct site-level generic ones; added a canonical link).
  Verified in a real browser against the prerendered output: search filtering and card-click
  gallery both still work post-hydration, console clean. Confirmed live on production
  (`curl https://odysseygloss.vercel.app/`): raw HTML has all 167 cards, bilingual text, and
  real `/entry/<slug>` links with zero JS executed. `check:pins` clean; lint unchanged (same 3
  pre-existing errors). Every page on the site is now fully crawlable by both Google and Baidu.
