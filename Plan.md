# Plan: Place search → map deep-links (approved 2026-08-07)

## Resume protocol — read this first
The user runs this plan **one phase per session**: they `/clear`, set the phase's suggested
model/effort via `/model`, then prompt **"next phase"**. On that prompt:

1. Read this whole file.
2. Take the **first phase whose Status is ☐** (skip phases marked PARKED unless the user
   explicitly opts in). If all non-parked phases are ✅, say so and stop.
3. Re-read the files that phase lists, implement **only that phase**, run its Verify steps.
4. Flip its Status to ✅, tick task boxes, append a line to the Status log at the bottom.
5. Commit (include this file so progress survives), push — `main` auto-deploys. If a push
   doesn't trigger a deployment, run the `vercel-github-autodeploy` skill.

Model/effort lines are **suggestions for the user to set before prompting** — if the session
is already on a bigger model, just proceed.

> This file previously held the Graecia pin-calibration plan (Atlas Phase 4). That work is
> applied + live (`f0a608f`, 2026-08-07); its history lives in CLAUDE.md's IN-FLIGHT note and
> the `atlas-phase-status` memory. Its open follow-ups are folded in here: rubri/aegyptus pin
> work is Phase 0 below; the flagged-pin review is the standing reminder just below.

## Standing reminder (not a phase — surface it every session until done)
- [ ] **USER reviews flagged Graecia pins** live at `#atlas/edit` against
  `graecia-draft/flags.md`: the four interpretive pins (Chalcis, Crouni, Enipeus, Gyrae), the
  Phylace label-vs-geography call, the possible Argos↔Mycenae castle swap.

## Goal
Searching a place on the front page currently ends at a gallery card whose only image is a
generic full-plate antique map (true for **61 of 84 places**; detection rule: every art key
ends in `-map` — verified equivalent to `art[k].file.startsWith("/art/map-")` on current
data). Meanwhile the Atlas already has a calibrated pin for every place except Ocean
(`npm run check:pins` enforces this). Fix: **place cards deep-link into the Atlas, opened
zoomed on that place's pin** with the existing announce halo + popup; add map-side search.

### Approved design decisions
- **Card click rule:** map-only places (61) → whole-card click opens the Atlas deep link
  (their gallery is strictly worse than the tiled plate). Places with real art (23: Troy,
  Egypt, Ithaca…) keep gallery-first click and get a small secondary "Map" affordance.
  Ocean (deliberately unpinned) keeps today's behavior.
- **Hash route:** `#atlas/<slug>/@<encodeURIComponent(term)>` — shareable/bookmarkable,
  consistent with "hash is the source of truth". `edit` stays reserved; legacy aliases parse.
- **Plate priority** for term→pin resolution: graecia → aegyptus → natoliae → palestinae →
  africae → rubri (rubri last: cramped inset + duplicate Greek pins until Phase 0).
- **Popup "View artworks"** shows only for entries with non-map art; map-only entries' popup
  shows just the name (the plate they're looking at IS the artwork, at higher res).
- Mythic/wandering places (Aeaea, Ogygia, The Underworld…) resolve to rubri's Vlyssis inset
  for now; routing them to the Journey map instead is PARKED Phase D.

---

## Phase 0 — pin prerequisites (make deep links land somewhere true)
**Status: ✅ done 2026-08-07**
**Model: Opus 5 · effort medium.** Vision task, but only 5 pins with large printed regional
labels — far easier than Graecia's 69 tiny toponyms. Escalate to Fable 5 only if a label
can't be found confidently. Method: the offline PIL workflow that calibrated Graecia
(grid-crops of the local master at native resolution, place on Ortelius's own printed
labels, then render each pin as a marked ring and visually verify — see the
`graecia-pin-drafting-method` memory; do NOT browser-drag).

Tasks:
- [x] `src/data/plates/aegyptus.ts`: **Egypt → (3030, 2270)**, on the "YP" of the plate's own
  printed "AEGYPTVS INFERIOR" Delta label (beside the Menelaites nome — apt for Menelaus).
  **Pharos → (1163, 3179)**, on the island town symbol labelled "Pharos colonia" inside the
  "ALEXANDRINOR. NOMVS" inset box, with "Pharos turris" (the lighthouse) labelled just east.
  The inset is the plate's own highest-fidelity depiction of the island — Ortelius drew it
  because the main sheet couldn't hold the detail — so pinning inside it is deliberate.
- [x] `src/data/plates/rubri.ts`: deleted the 69 terms also pinned on graecia (the full
  graecia term set turned out to be a subset of rubri's) — **rubri 100 → 31 pins**. Kept:
  Egypt/Libya/Ethiopia/Pharos, Cyprus, the Levantine pins (Phoenicia, Sidon, Mount Solyma),
  the Vlyssis-inset mythical/voyage places, the Underworld cluster, Ortygia, and the four
  noGloss regional pins. The Vlyssis inset is now legibly sparse.
- [x] `src/data/plates/rubri.ts`: **Arabia → (3280, 3960)** on "ARABIA EVDAEMON, Sive FELIX";
  **Persia → (5250, 3175)** on "PERSIA." inland of the Persian Gulf; **India → (7760, 4530)**
  mid-peninsula on "Mambari regnum" — the one compromise, since this plate prints **no**
  "India" anywhere (Ortelius labels the subcontinent with Ptolemaic regional names only:
  SYNRASTRENA, ARIACA, DACHINABADES, LIMYRICA, MASALIA); the nearest cognate word is the
  "Indus fluvius" river annotation at ~(7200, 3450), rejected as too far north/off-landmass.
- [x] Regenerated `PLACES.md` from the plate files + `glossary.json`.
- [x] Updated CLAUDE.md TODO item 1 (b)/(c) as done, plus its IN-FLIGHT note and the Atlas
  section's pin-calibration status.

Verify: ✅ `npm run check:pins` clean (rubri 31 · graecia 69 · aegyptus 2 · natoliae 4 ·
palestinae 2 · africae 3); ✅ marked-ring crops of all 5 moved pins eyeballed at native
resolution — each sits on its printed label; ✅ `npm run build` + `vite preview` spot-open of
`#atlas/aegyptus` (both pins on their labels, Pharos correctly inside the inset) and
`#atlas/rubri` (Arabia/Persia/India on their labels; inset decluttered).

## Phase A — core deep-link wiring (the feature)
**Status: ✅ done 2026-08-07**
**Model: Opus 5 · effort medium** (delicate react-leaflet timing + several documented traps;
Sonnet 5 · high is the budget alternative — the traps are all written down below).

Tasks:
- [x] `src/data/plates/index.ts`: export `PLATE_PRIORITY` (order above) and
  `findPin(term): { slug: string; place: AtlasPlace } | null` — exact-term match over each
  plate's `places` in priority order.
- [x] `src/App.tsx` — hash parsing: extend the atlas route to `#atlas/<slug>/@<term>`,
  returning `focusTerm` alongside `{slug, eyeball}`.
  **Trap:** `parseMapHash` lowercases the whole hash — split the `@` segment off the RAW
  hash before lowercasing, `decodeURIComponent` it, and resolve it against pin terms
  case-insensitively (store the pin's canonical term in the route).
- [x] `src/App.tsx` — cards: for place entries (`tag === "place"`) with a `findPin` hit,
  apply the approved click rule (map-only → whole-card deep link; art-rich → gallery click +
  compact "Map" button, e.g. MapIcon `btn-xs` beside the tag badge).
  **Trap:** each card is currently a `<button>` — a nested interactive control inside it is
  invalid HTML. Restructure the card to a `<div role="button" tabIndex={0}>` with
  onClick/onKeyDown (keep DaisyUI classes), or overlay the Map control as an
  absolutely-positioned sibling, not a child button.
- [x] `src/AtlasMap.tsx` — new optional `focusTerm` prop (App passes `atlasRoute.focusTerm`):
  - Focus only **after** `FitWhenReady` has landed — gate the effect on the existing
    `bounds` state, then `map.setView(unprojectPixel(map, x, y, config.maxZoom), Z)` with
    `Z ≈ config.maxZoom - 2.5` (tune visually; edit-mode `PlaceFocuser` hardcodes 3).
    Coordinate math via the live-map helper only (static `L.CRS.Simple` trap).
  - Reuse the announce halo in view mode: `Pins` picks `pinIconFocused` only when
    `editing && term === highlightTerm` — drop the `editing &&` gate; set `highlight` from
    the focus effect (the 8s nonce timer already exists).
  - Auto-open the focused pin's popup: ref the matching Marker, then
    `map.once("moveend", () => ref.current?.openPopup())`.
    **Trap (popup-death, fixed in 1464301):** never `setPins`/reorder in any view-mode
    path — positional keys remount markers and Leaflet kills their popups.
  - AtlasMap is keyed by slug in App, so same-plate focus changes do NOT remount — the
    effect must depend on `focusTerm` and re-fire on repeat navigations.
- [x] Popup "View artworks" gating: App passes a `hasRealArt(term)` predicate (entry has any
  non-`-map` art key); popup shows the button only then.
- [x] Ocean and non-place cards: behavior unchanged. `switchPlate` keeps emitting focus-less
  hashes (unchanged).

Verify: `npm run check:pins`; **`npm run build` + `vite preview`** (dev≠prod traps; ports
5173/5174 are usually taken — read Vite's log for the real port). In the prod build:
cold-load `#atlas/graecia/@Ithaca` → fit, glide, halo, popup opens; Chios card (map-only) →
map; Troy card → gallery, its Map button → map; popup survives >1s and "View artworks" works
(popup-death regression); Ocean card → gallery; close map → hash cleared; responsive-mode
mobile spot check (full-screen modal, popup tappable).

### Phase A — as built (deltas from the plan)
- Focus zoom landed at **`maxZoom - 1.5`**, not the sketched `-2.5`: at `-2.5` the plate is
  still too wide to read Ortelius's engraved toponym under the pin (verified side by side on
  `@Ithaca`). `-1.5` shows the label plus enough coastline to orient.
- `findPin(term, preferSlug?)` matches exact-then-case-insensitive and lets an explicit route
  slug outrank `PLATE_PRIORITY`, so `#atlas/rubri/@Ithaca` stays on rubri.
- The halo now also shows in view mode; swapping a marker's *icon* is safe for an open popup
  (the popup is its own map layer) — only unmounting the marker kills it.
- **New guard:** `DeepLinkFocus`'s cleanup closes the popup it opened. A popup left open across
  a plate switch (AtlasMap remounts on `key={slug}`) is torn down mid-flight and Leaflet's
  `DivOverlay.update()` then runs `_adjustPan` against a removed map — a hard
  `Cannot read properties of null (reading 'layerPointToContainerPoint')` that blanks the app.
  Hit it live during verification; rare before this feature, routine now that every deep link
  opens a popup.
- **Testing gotcha (cost most of the debugging time):** an occluded/backgrounded Chrome tab
  suspends the render loop, so `FitWhenReady`'s **ResizeObserver never fires**, `bounds` stays
  null and the focus effect never runs — the map just sits at "fit all" with no tiles. It looks
  exactly like a broken feature. Force a paint (take a screenshot) between navigations when
  driving these maps from an automation tool.

## Phase B — search inside the Atlas
**Status: ☐ not started**
**Model: Sonnet 5 · effort medium** (contained UI feature; the pattern exists in the edit
footer).

Tasks:
- [ ] View-mode search in the Atlas modal header (edit mode keeps its footer search):
  compact input or expandable icon-button — the header already holds title + plate select +
  close; don't crowd it on mobile.
- [ ] Matches across ALL plates: flatten `PLATES` → `{term, label?, slug}`, substring match
  on term/label, ≤8 results with plate name shown; glossary-linked pins ranked above
  `noGloss` ones (but include both).
- [ ] Selecting a result always navigates the hash to the deep link — same-plate changes
  re-fire the `focusTerm` effect (no remount), cross-plate remounts via `key={slug}`.

Verify: from `#atlas/rubri`, search "Ithaca" → switches to graecia and focuses; same-plate
search re-focuses; mobile header layout not crowded (responsive mode).

## Phase C — per-place cover crops (optional polish)
**Status: ☐ not started**
**Model: Sonnet 5 · effort medium** (mechanical bake behind a mandatory visual QA gate;
escalate to Opus 5 only if framing judgment gets hairy).

Replace the "same generic plate on 62 cards" look: each place's `<slug>-map` art record gets
its own crop of the plate it deep-links to, so the card cover shows *its region* and matches
where the link lands.

Tasks:
- [ ] Script (`scripts/bake_place_crops.py`): for every place with a `-map` art record AND a
  pin — crop `plates/<findPin slug>/master.jpg` around `(x,y)` (~1600×1200 at native res,
  clamped at plate edges), recompress per house rule (max 1600px, q82, strip), write
  `public/art/<key>.jpg` (key = the existing `<slug>-map` key).
- [ ] ImageMagick contact-sheet montage of all crops; **eyeball BEFORE uploading** — fix
  framing outliers (labels cut off, pin at an edge).
- [ ] Upload via boto3 against the **S3-compatible endpoint** (creds `.env.r2.local`; NOT
  the Cloudflare REST API — account-wide rate limit). New keys → no cache-bust concern; old
  `map-*.jpg` objects stay as accepted orphans.
- [ ] Update each record in `art.json`: `file: "/art/<key>.jpg"`, credits → the Ortelius
  plate actually cropped (artist "Abraham Ortelius", plate title, year, plate's Commons
  `source`). Note this deliberately switches some places off the non-Atlas maps (Delisle
  northern, Homer world, Lapie voyages) onto their Ortelius plate. Ocean (unpinned) keeps
  `map-world` untouched.
- [ ] Keep the `*-map` exclusion in dedup/perceptual checks (keys keep the suffix — no
  change needed, just don't break it).

Verify: montage approved; spot-check several cards + lightbox captions live/preview;
`npm run check:pins` still clean (no pin data touched, cheap to run).

## Phase D — Journey-map routing for mythic places (PARKED — opt-in only)
**Status: ⏸ parked** — skip on "next phase" unless the user explicitly asks for it.
**Model: Opus 5 · effort high** (JourneyMap's tour/camera code is the trickiest in the repo).

Scope sketch: alias table place-term → journey stop term (Aeaea→Circe,
Telepylus→Laestrygonians, Land of the Cyclopes→"Cyclops (pl. Cyclopes)", Land of the
Lotus-Eaters→Lotus-Eaters, The Underworld→Hades, Aeolia→Aeolus; Ogygia/Scheria/Thrinacia/
Ithaca/Troy are already stop terms); `focusTerm` prop on JourneyMap reusing the legend-focus
camera path; those ~16 places' cards then prefer the Journey map over rubri's cramped inset.
Fold in CLAUDE.md TODO 3(a) (hero mini-map + "Show on map" from journey cards).

---

## Status log
- 2026-08-07 — Plan approved (proposal + design decisions locked in conversation). Nothing
  implemented yet. Next: Phase 0.
- 2026-08-07 — **Phase A done.** `PLATE_PRIORITY` + `findPin` in the plate registry;
  `#atlas/<slug>/@<term>` parsing (focus segment split off the raw hash before lowercasing,
  resolved to a canonical pin term); cards restructured to `div role="button"` so art-rich
  places can carry a nested "Map" button while the 61 map-only places deep-link on whole-card
  click; `AtlasMap` gained `focusTerm` (glide + halo + auto-opened popup) and `hasArt` popup
  gating. Verified in a production build. Next: Phase B.
- 2026-08-07 — **Phase 0 done.** aegyptus's 2 pins and rubri's Arabia/Persia/India calibrated
  offline (PIL grid-crops + marked-ring verification); rubri pruned 100 → 31 pins; PLACES.md
  regenerated; CLAUDE.md TODO 1 (b)/(c) closed. Every Atlas pin is now off its seed grid — the
  only pin work left is the user's spot-check of the flagged Graecia pins (standing reminder
  above). Next: Phase A.
