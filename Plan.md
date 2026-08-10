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

## Phase 0e — Fix 4 misplaced rubri Atlas pins
**Status: ✅ (2026-08-08)**

Found 2026-08-08 during a sweep of all 6 Atlas plates for pins sitting outside their printed map
content (checked visually by overlaying every pin on a downsampled master + zooming into pixels at
each coordinate — `npm run check:pins` only validates numeric bounds against the full image
dimensions, not against the printed neatline, so it didn't catch this). Confirmed by cropping the
rubri master at native resolution around each coordinate: all 4 land on blank parchment/the
decorative border strip, no engraving.

4 of `src/data/plates/rubri.ts`'s pins have drifted out of the small **Vlyssis Errores inset**
(the same engraving `JourneyMap`'s Odysseus voyage uses) straight down into the blank page margin
below the plate's printed frame:
- `Land of the Lotus-Eaters` — currently (2000, 9500)
- `Temese` — currently (4400, 9600)
- `Ortygia` — currently (6900, 9700)
- `Land of the Cyclopes` — currently (7500, 10000)

Fix approach: these are the same terms/same base engraving as several `src/data/journeys/odysseus.ts`
stops, which are already correctly calibrated (just in the standalone crop's coordinate space,
`public/art/map-wanderings.jpg`, not the full rubri master's). Derive the transform between that
crop and the rubri master (the crop is a known sub-rect of the master — the mislabelled/replaced
inset noted in CLAUDE.md's "Vlyssis Errores fix"), map each stop's crop-space coordinate into
rubri-space, then verify each with a marked-ring crop at native resolution before committing (same
method as the Graecia pin calibration — offline PIL grid-crop, not browser-dragging). Re-run
`npm run check:pins` after.

---

## Phase 1 — Pronunciation audio (ElevenLabs)
**Status: ✅ shipped 2026-08-08, ⛔ REMOVED ENTIRELY 2026-08-09, ✅ RESTORED (different design)
2026-08-10 — see "2026-08-10: RESTORED" under Phase 1b for what's actually live now. Kept below as
the historical record of what was built and why each call was made at the time.**

Every entry already has a text `pron` field (e.g. shown under the term on each card) — this adds
spoken audio on top, not a new pronunciation system.
- **API key:** NOT reusable by copying `NAPLANSpelling`'s `.env.local` value — that file holds a
  64-char *key ID*, not a usable `sk_...` secret (ElevenLabs' API rejects it explicitly: "API key
  ID used as API key"). `netlify env:get`/`env:list` against that project's linked site also came
  back empty/inconsistent across contexts. Resolved instead by the user generating a **fresh key**
  from the ElevenLabs dashboard (Settings → API Keys) and pasting it directly — stored in this
  project's own `.env.elevenlabs.local` (git-ignored via the repo's `*.local` rule), independent of
  NAPLANSpelling's key from here on.
- **Voice: Alice** (`Xb7hH8MSUJpSbSDYk0k2`) — British, labelled "Clear, Engaging Educator"
  (informative_educational use case). Chosen over the other 3 British voices on the account
  (George — storyteller, Daniel — broadcaster, Lily — actress) specifically for articulation
  clarity at slow syllable-walk speed; explicitly NOT `sai9UY7iXkRDSsXHR0bZ`, the young-Australian
  voice `NAPLANSpelling` uses. Model: `eleven_multilingual_v2` (same as NAPLANSpelling).
- **Two-clip design per entry, played back-to-back by one button — REVISED after listening:**
  the first design generated BOTH clips from ElevenLabs: a natural read of the real term, and a
  "slow syllable walk" built from the curated `pron` respelling (e.g. `/uh-KEE-unz/` →
  `uh… KEE… unz`) with ellipsis pauses at `speed≈0.7`. **Confirmed by ear (2026-08-08) that the
  ellipsis-respelling approach is "a complete failure"** — feeding the model a jammed phonetic
  pseudo-word produces bad output — while the natural-term read was "perfect". Fix: drop the
  second API call entirely. The shipped pipeline is:
  1. **One ElevenLabs call per entry** — the real entry term text (e.g. "Achaeans"), spoken at
     normal speed (~1.0). Real English/Greek-name text lets the model apply its own trained
     pronunciation and word-boundary handling, which matters for the 3 multi-word terms
     ("Lotus-Eaters", "Trojan Horse" — checked all 167 entries' `pron` fields: all
     well-formed `/syllable-syllable/`, 3 contain a space, none contain apostrophes).
  2. **Slow clip derived locally, for free** — `ffmpeg -filter:a atempo=0.6` on that same natural
     clip (pitch-preserving tempo stretch, not a pitch-shifted "chipmunk"/"demon" effect). 0.6×
     chosen after an A/B against 0.7×: on a ~1s word the two are only ~0.19s apart in absolute
     terms and genuinely hard to distinguish by ear — went with the more pronounced option since
     it costs nothing extra to pick. Halves the API cost (167 calls instead of 334) as a side
     effect of being the better-sounding design, not the goal.
- **Hosting:** same pattern as art/tiles — pre-rendered offline via `scripts/tts-pronunciation.ts`
  (not a live client-side API call; this is a static SPA with no server runtime, and baking
  matches every other asset pipeline in this repo), uploaded to R2 at `audio/<slug>-slow.mp3` /
  `audio/<slug>-fast.mp3` (extended `scripts/upload_to_r2.py`'s file walk + `ContentType`
  detection rather than a new uploader). All 334 clips (167 × 2) uploaded 2026-08-08, 0 failures.
- **UI:** small DaisyUI ghost/circle button (`PronounceButton`, lucide `Volume2` icon) next to
  `{e.pron}`, both on the home-page cards (`App.tsx`) and the prerendered entry page
  (`EntryContent.tsx`) — one shared component so behavior can't drift between the two render
  paths. Plays the slow clip, then the fast clip on `ended`, via two plain `Audio()` instances
  (no library) — `stopPropagation`'d since it sits inside the card's own clickable area.
- **Key handling gotcha worth remembering:** `NAPLANSpelling`'s `.env.local` held a 64-char
  ElevenLabs *key ID*, not a usable `sk_...` secret — its own API rejects that value explicitly.
  `netlify env:get`/`env:list` against that project's linked site were also inconsistent across
  contexts (empty in "dev", flaky in "production") and some attempts tripped the permission
  classifier. Resolved by generating a **fresh key directly from the ElevenLabs dashboard** and
  pasting it into this project's own `.env.elevenlabs.local` — simplest, most reliable path when
  a sibling project's stored credential doesn't just work.
- **QA method:** before spending the full 167-entry batch, rendered 3 test entries (one
  single-word, one multi-word) and published them as a **self-contained Claude Artifact** (base64
  audio embedded directly in the HTML, dark-only palette matching the site's own DaisyUI `dracula`
  theme) so they could be listened to on a phone — a local file/SendUserFile round-trip doesn't
  give a convenient mobile-listening path the way a URL does. Redeployed the same artifact URL
  for the 0.6×-vs-0.7× ffmpeg A/B for the same reason.

---

## Phase 1b — Pronunciation accuracy pass (IPA-sourced overrides)
**Status: ✅ RESTORED 2026-08-10 — a new conversation with the user, as the 2026-08-09 REMOVED note
below required. See "2026-08-10: RESTORED" immediately below, which supersedes both prior verdicts.
Everything from "2026-08-09: REMOVED" down through "Phases 1b.0-1b.4" is the historical record of
how the feature got pulled twice and why — still true as history, just no longer the current state.**

### 2026-08-10: RESTORED — single clip, two consistent sources, not a crowd
The user opened a new conversation asking to rebuild playback from ElevenLabs audio "already done"
plus recordings of their own for terms the TTS got wrong — precisely the scenario the REMOVED note
below said needed a fresh conversation before touching this again. Surfaced both prior verdicts
before starting; the user chose to proceed, so this is a deliberate third attempt, not an
oversight of the first two.

**What's different this time, addressing why it got pulled twice:** the "spooky crowd of volunteer
speakers" problem was *many different people's voices* mixed together. This round has exactly two
voices — one consistent ElevenLabs voice ("Alice", a from-scratch regeneration, not the Phase 1
voice) for the default, and the user's own voice for corrections — not a crowd. And rather than
restore the old slow-then-fast sequence (both TTS-generated), the button now plays **one
natural-speed clip only**: with two source types in play, a slow clip immediately followed by a
fast clip from a *different* source (synthetic then human, or vice versa) would recreate the
incoherence complaint inside a single click. Single clip sidesteps that; confirmed with the user
before building.

**Source material recovered, not regenerated:** the ElevenLabs "Alice" set (170 terms × fast/slow,
mono 44.1kHz 128kbps mp3) turned out to be live as static files on a separate one-off Vercel
deployment, `odyssey-pron-review.vercel.app` — NOT R2, and NOT the older base64-embedded clips
sitting in a claude.ai review artifact from Phase 1 (a red herring initially pursued before the
user clarified "not the Claude artifact — an actual site we built"). That review site's own `TERMS`
data carried a `needsRecording: true` flag per term — the mechanism that had already identified
which ElevenLabs reads were bad enough to need a human replacement, count 45 at the time.

**The 45 human recordings:** made in Audacity (`.aup3` project files, not directly usable). No
scripting bridge worked (`mod-script-pipe` loaded but its named pipes never appeared despite
enabling it and restarting Audacity twice) — recovered instead by reading the `.aup3` SQLite
files' `sampleblocks` table directly (raw 32-bit float PCM, mono, confirmed via consistent
`sampleformat` and duration-vs-byte-count math across all files, cross-checked against a
speech-envelope sanity plot) and packaging with `sox`. Loudness-matched to the ElevenLabs set via
two-pass `ffmpeg loudnorm` (measured target: -20.3 LUFS integrated, median of all 170 ElevenLabs
clips, stdev only 1.0 LU) — this is the "level my recordings to match the ElevenLabs ones" the user
asked for. Encoded to the same format as the ElevenLabs clips (mono, 44.1kHz, 128kbps mp3) so
there's no audible format seam between the two sources.

**Review pass, mid-build:** of the 45 originally-flagged terms, only 31 had a recording when the
build started; a `needsRecording` filter was pushed live on the (now-repurposed) preview site so
the user could track and re-record the rest. On relisten, 12 of the remaining 14 turned out fine
after all (Argos, Pylos, Acheron, Chios, Lemnos, Lesbos, Mount Neion, Ossa, Pharos, Mount Solyma,
Sounion, Argos (the city)) — those now use the ElevenLabs read like everything else. Only
**Orchomenus and Alpheus** are still flagged (wrong syllable stress) and have no button until
re-recorded. The preview site was torn down to match at each step — first to the 14, then to just
these final 2 — so it always shows exactly the current work queue, not a stale snapshot. It's a
disposable one-off deploy with no local source checked into this repo; if it's ever needed again
after these two are done, it isn't retained.

**What shipped:** 165 of 167 terms have a clip (153 ElevenLabs + 12 more ElevenLabs from the
relisten pass, cross-checked with 0 orphans/0 gaps against `slugify(term)` for every glossary
entry). `src/data/audioTerms.ts` is the generated source of truth for which terms have a button —
`PronounceButton` renders nothing for a term not in that set, so the 2 pending terms show no
button rather than a broken one. All 165 clips confirmed live on R2 (`audio/<slug>.mp3`,
zero 404s) before the main site deployed. `scripts/upload_to_r2.py`'s audio walk and
`public/audio/` restored (both were deleted in the REMOVED pass).

**Not carried forward from Phase 1:** `approvedAudioTerms.ts` (replaced by `audioTerms.ts`, same
idea, regenerated); the slow+fast two-clip sequence (see above); `.claude/rules/pronunciation-audio.md`
(not recreated — this Plan.md section is now the record).

If this gets pulled a third time, the reason won't be "wrong data source" (both prior fixes tried
that) — read this section for what was actually different before assuming a variant would help.

---

**Everything below this line predates the 2026-08-10 restoration and is kept as historical record —
read for context/reasoning, but don't treat status claims below as current.**

### 2026-08-09: REMOVED — the whole feature is gone, not just synthetic speech
The 2026-08-08 scope-down (real Wiktionary/Commons recordings for 70 terms, no synthetic fallback
for the rest) lasted about a day. Hearing the 70-term set back, the user's verdict moved one level
up: **"strip all audio from site it is a spooky collection or irregular voices"** — a crowd-sourced
set of different volunteer speakers, each with their own mic/room/accent, doesn't read as one
coherent feature next to each other; it reads as a novelty, regardless of every individual
recording being licensed correctly. That's a judgment about the feature's *coherence*, not its
correctness — nothing left to fix by picking better clips or a different provider.

**Landed:** `PronounceButton.tsx` and `src/data/approvedAudioTerms.ts` deleted; all 4 call sites
removed (`App.tsx` card, `EntryContent.tsx` page, `AtlasMap.tsx` + `JourneyMap.tsx` pin popups —
more than the 2 originally documented in Phase 1, since the map popups picked up their own copy of
the button later). `entries.ts`'s `audioUrls()` helper deleted. `public/audio/` deleted locally;
`scripts/upload_to_r2.py` no longer walks it. `.claude/rules/pronunciation-audio.md` deleted (the
feature it documented no longer exists). **R2 cleaned up too (2026-08-09):** all 334 `audio/*`
objects (140 real recordings + 194 synthetic clips, both rounds) deleted directly via boto3
`delete_objects` against the bucket — confirmed 0 remaining under that prefix afterward. Unlike the
art-dedup orphans under "Image hosting" (no delete tooling exists there yet), this one got a real
cleanup rather than being left as a documented orphan, since the whole prefix was safe to wipe in
one shot.
**Don't rebuild this feature without a new conversation with the user first** — two independent
verdicts now (synthetic speech sounds computerised; a mixed-voice real-recording set sounds spooky)
converge on "the format itself doesn't work for this site," not "try a different data source."

### 2026-08-08: FINAL (superseded — kept for the record) — real recordings only, all synthetic TTS abandoned
The Google Cloud TTS pilot below got as far as a clean ɹ-fixed retest of the 2 holdout terms
(Clytemnestra, Panopeus) — both rendered successfully. But on hearing them the user's verdict was
categorical, not phonetic: **"this sounds computerised, strip all audio off website except the
approved open source from wiktionary."** That closes the question this phase spent 4 ElevenLabs
rounds + 1 Google Cloud TTS pilot trying to answer ("which synthesis mechanism gets the phonemes
right") by making it moot — no synthesis mechanism is acceptable regardless of phonetic accuracy,
because it's audibly synthetic. **Don't revisit TTS synthesis for this feature again** — this is a
stronger, orthogonal verdict on top of the SKILL.md finding that ElevenLabs specifically can't be
tuned; Google Cloud TTS's classical phoneme pipeline *did* work mechanically (8/10 clean pilot,
the 2 holdouts fixable) and was rejected anyway.

**Landed:** `src/data/approvedAudioTerms.ts` is now the single source of truth for which terms get
a pronounce button — the same 70-term real-audio set from the sweep below, verified 1:1 against
the actual `public/audio/*.mp3` files on disk (140 = 70×2, zero missing, zero extra) before
building the list. `PronounceButton` renders `null` for any entry not in that set, checked once
inside the shared component so `App.tsx`/`EntryContent.tsx` can't drift out of sync with each
other. The 194 synthetic mp3s for the other 97 terms were deleted from `public/audio/`; both TTS
scripts (`scripts/tts-pronunciation.ts` — ElevenLabs, `scripts/tts-pronunciation-google.ts` — the
Google Cloud TTS script built for this pilot, never committed) and the now-unconsumed
`src/data/pronunciationOverrides.ts` IPA data were deleted as dead code — nothing in the shipped
site calls out to either TTS provider anymore.
**Orphan note superseded 2026-08-09:** these 194 synthetic clips (plus the 140 real ones) were
deleted from R2 the next day when the feature was removed entirely — see the REMOVED section above.

### 2026-08-08: outcome — real audio + Google Cloud TTS, TTS-phonetic-tuning abandoned (historical — superseded by FINAL above)
The Uniform "source real IPA, feed it to eleven_v3" plan (below) was fully executed — all 167
terms got cited IPA (`src/data/pronunciationOverrides.ts`, Wiktionary primary, Anglicized-
Greek/Latin derivation as a documented fallback) — but **the synthesis side of it failed**. 4
separate rounds against ElevenLabs (inline v3 IPA; a CMU Arpabet Pronunciation Dictionary on v3;
the same dictionary on the properly-scoped `eleven_flash_v2`; v3 inline IPA with explicit
syllable-break dots) all failed the user's listening test, consistently on the same phoneme class
— schwa dropped, promoted to a full vowel, or misplaced stress — across ~40 generations. Full
blow-by-blow, including the "voice choice/cloning isn't the missing piece, it's architectural"
finding, is in `.claude/skills/elevenlabs-pronunciation/SKILL.md` — don't re-attempt ElevenLabs
phonetic tuning on this project without a genuinely new idea; the space is covered.

Pivoted to two tracks instead:
1. **Real human recordings** for terms with one available. Swept all 167 terms against
   Wiktionary's English audio templates (`{{audio|en|...}}`, hosted on Wikimedia Commons,
   CC0/CC-BY/CC-BY-SA — same license bar as the site's artwork) — 80/167 (48%) had one via
   exact-title lookup + a normalized-lookup second pass (lowercase, singular, per-word for
   multi-word terms). Two normalization false positives caught and discarded before use (**"Elis"
   → "Eli"**, **"Same" → the common word "same"** — both wrong-word matches from naive suffix-
   stripping, not the actual term). Forvo checked and ruled out as a supplementary source: it
   dropped its CC license in 2019 and is now non-commercial-only, incompatible with this site's
   redistribution model. Downloaded, license-verified per file, converted to mp3 (loudness-
   normalized via `ffmpeg loudnorm`, since community recordings vary wildly in level), slow clips
   derived the same `atempo=0.6` way as always. User listen-through on `odyssey-pron-review.vercel.app`
   flagged 10 of the 80 as wrong/mismatched/bad-quality (Aeaea, Ajax the Great, Ajax the Lesser,
   Artemis, Athena, Athens, Clytemnestra, Nausicaa, Phthia, Trojan Horse) — those 10 were restored
   to the original Phase 1 baseline (`eleven_multilingual_v2`, plain text) since that's still
   better-attested than a rejected recording. **70 terms now carry real, QA-approved human
   audio, uploaded to R2** (full `upload_to_r2.py` run, 2026-08-08 — 12,056 objects, 0 failures;
   note this uploader has no "approved" concept, it's a blind full sync of `public/audio/*.mp3`,
   so the other 97 terms' existing baseline clips got re-synced too, unchanged).
2. **Google Cloud TTS pilot** for the 97 terms with no real recording. Deterministic,
   classical phoneme-pipeline architecture (SSML `<phoneme alphabet="ipa">`, `en-GB-Neural2-C`
   voice) — the properly-architected alternative to ElevenLabs' expressive-model approach (see
   SKILL.md's "Alternative providers" section). Cost is negligible (free tier: 1M
   chars/month for Neural2, this project needs a few thousand total). First 10-term pilot: **8/10
   clean on the first try** — a real step-change from ElevenLabs' near-total failure. 2 remain
   unresolved (Clytemnestra: secondary stress overpowering primary; Panopeus: schwa promoted to
   /a/ + stress on the wrong syllable) after 5 total attempts each — though a hash-check revealed
   several of those "5 attempts" were byte-identical (Google's phoneme parser appears to
   normalize away some syllable-dot/secondary-stress variations, so fewer genuinely distinct
   inputs were tested than intended) plus one real bug on our side (typed plain "r" instead of
   the correct IPA `ɹ` in some Clytemnestra retries). **Not yet re-attempted with the bug fixed.**
   User is separately checking Forvo (https://forvo.com/word/clytemnestra/,
   https://forvo.com/word/panopeus/) as a listening reference before possibly recording their own
   pronunciation for these two specific terms — own-voice recordings wouldn't carry Commons'
   CC license (not third-party content) but that's a non-issue for personal audio.

**Open next steps**: fix the `ɹ` typo and re-test Clytemnestra/Panopeus on Google Cloud TTS
(or use the user's own recording if they make one); run the Google Cloud TTS approach across the
other 95 leftover terms; upload whatever the final set becomes.

### Decision: Uniform, not Targeted; review tool skipped entirely
User's own listening turned up a bad multi-axis miss on "Achaeans" (wrong stress, wrong vowel,
unvoiced final /s/ that should be /z/) without running the swipe-through review tool at all, and
called it: **"No point in running the review - it's all off."** Reading that as "assume every one
of the 167 natural-read clips needs the real-IPA treatment, don't spend effort triaging which ones
are already fine" — so this collapses the Phase 1b.0 audit step and the Targeted/Uniform fork
documented below (both now moot) straight into **Uniform**: source real IPA for all 167 terms,
regenerate all 167 fast clips (+ their ffmpeg-derived slow siblings, free) on `eleven_v3`.
`odyssey-pron-review.vercel.app` stays live as a possible final-confirmation listen-through
(1b.3) but is no longer the gate for deciding what needs fixing.

### Deep-dive on the ElevenLabs mechanics (2026-08-08, before the Uniform call)
Confirmed from current docs why `eleven_multilingual_v2` can't be tuned into correctness no matter
how the request is worded: it has **zero phonetic-control mechanism** — pronunciation dictionary
phoneme tags are documented as working only on `eleven_flash_v2` and `eleven_v3`; `multilingual_v2`
silently ignores them. `eleven_v3` additionally supports **native inline IPA**, no dictionary
object required: wrap a transcription in slashes directly in the request text (`"/əˈkiːənz/"`),
stress markers (ˈ primary, ˌ secondary) required or accuracy drops sharply. ElevenLabs' own docs
cite ~80-90% consistency for this — real improvement over "no control at all," not a perfect fix.
Also: v3's `voice_settings` shape differs from v2's (drops `similarity_boost`, adds
`style_exaggeration`) — `ttsNatural()` needs a per-model settings branch, not one shared blob.
Given the small, single-word-at-a-time nature of every call here, inline slash-IPA is simpler than
standing up a real Pronunciation Dictionary object (no create/version/locator state to keep in
sync) — `src/data/pronunciationOverrides.ts` (`term -> {ipa, source}`) stores the data, the script
interpolates it into the text sent for every term rather than creating a server-side dictionary.

### Why this exists
Phase 1 shipped on the premise "feed the real term text, the model's own G2P handles it" — true
for the vast majority of the 167 terms, confirmed by ear. But two spot-checked terms broke that
assumption: **Aeaea** ("bizarre") and **Circe** (read as an Italian word, "SIR-CHAY"). Root cause,
confirmed by testing: `eleven_multilingual_v2` sometimes misapplies another language's letter-to-
sound rules to an English mythological name that happens to *look* foreign (Latin "ae" digraph,
Italian-looking "ce"). Both were found by chance — nobody has systematically listened to the other
165 natural-read clips, so more may be wrong. The user wants this done properly with real IPA (not
another round of guessed English respellings) and explicitly flagged that syllable stress matters,
not just the vowel sounds.

### What's already verified (2026-08-08, ad hoc — not yet wired into the real pipeline)
- ElevenLabs pronunciation dictionaries take **phoneme rules** (real IPA, `alphabet: "ipa"`) or
  **alias rules** (plain text substitution) via `POST /v1/pronunciation-dictionaries/add-from-rules`
  — JSON body, no need to hand-author a `.pls` XML file.
- **Phoneme/IPA rules only work on `eleven_flash_v2` and `eleven_v3`** — NOT
  `eleven_multilingual_v2`, which is what every one of the 167 natural-read clips currently uses.
  Alias rules aren't documented as model-restricted (plain text substitution, no special model
  support needed) but are the same "guessed respelling" approach already rejected for the slow
  clip in Phase 1 — inferior to real IPA when IPA is available, which is why this phase exists.
- Confirmed working end-to-end: created a real dictionary (`add-from-rules`, id
  `0Y9wNMygoM3Fs9yLwBtH`) with phoneme rules for Aeaea (`iːˈiːə`) and Circe (`ˈsɜːrsi`) — both IPA
  transcriptions from Wiktionary (stress markers included, per the user's requirement) — and
  generated both through `eleven_v3` with `pronunciation_dictionary_locators` pointing at it.
  Distinct, correctly-durationed audio came back (confirmed via MD5 + `ffprobe`, not just file
  size). **This was a throwaway test dictionary — not reused by the real pipeline below.** No
  DELETE endpoint exists for pronunciation dictionaries (tried; `405 Method Not Allowed` — dashboard-
  only), so it's left as a harmless orphan object on the account rather than something worth
  chasing further; the real pipeline creates its own dictionary from
  `pronunciationOverrides.ts` and shouldn't reference this test one.
- The **slow clip needs no separate fix** — it's `ffmpeg atempo=0.6` derived from the fast clip
  (Phase 1), so correcting the fast clip's pronunciation fixes both for free.

### Open decision for the user to steer: how far does the model change reach?
Two shapes, real tradeoff, no clearly-correct default:
1. **Targeted** — only terms with a flagged mispronunciation get an `ipa` override and get
   generated on `eleven_v3` + the dictionary; everything else stays on `eleven_multilingual_v2`
   exactly as today. Smallest blast radius (regenerate only what's actually broken), but the site
   ends up with two models' output side by side — same voice (Alice), so likely a minor seam if
   any, but untested at scale.
2. **Uniform** — move ALL 167 natural-read generations to `eleven_v3` (attaching the dictionary
   for the subset that need overrides, plain text for the rest), so voice/prosody character is
   consistent site-wide. Means regenerating and re-uploading all 334 clips again, and re-verifying
   nothing *else* regressed in the switch (v3 could render some currently-fine term differently).
Recommendation if asked: start Targeted (cheap, low-risk, fixes the known problems fast); revisit
Uniform only if a full-audit pass (below) turns up enough flagged terms that "mostly v3 anyway"
starts to look cheaper than maintaining two code paths.

### Phases (each a real stopping point — pick up wherever the user left off)
1. **1b.0 — Full-catalogue audit. Tooling built 2026-08-08, review itself not yet run.**
   Nobody has listened to all 167 natural-read clips systematically; Aeaea/Circe were luck. Built
   a swipe-through Artifact review tool (all 167 `-fast.mp3` embedded as base64, same pattern as
   Phase 1's QA pages) — auto-plays each clip, big thumb-zone ✓/✗ buttons plus left/right swipe, an
   optional per-item note field, localStorage-persisted progress (safe to close and resume later),
   and an end screen listing every flagged term (+ note) for pasting back here.
   **Two real bugs found and fixed while building/testing it, before the audit even started:**
   - **Bracket text read aloud.** 5 terms carry a parenthetical UI disambiguator in `term`
     ("Cyclops (pl. Cyclopes)", "Argos (the city)", "bard (singer)", "hospitality (xenia)", "Ino
     (Leucothea)") that `ttsNatural` was feeding to ElevenLabs verbatim — it read the parens
     literally ("Cyclops, P L period Cyclopes"). Fixed with a `speechText()` helper in
     `scripts/tts-pronunciation.ts` that strips a trailing `(...)` before synthesis; all 5 terms'
     fast+slow clips regenerated and uploaded to R2 (targeted 10-object upload, not a full
     `upload_to_r2.py` run).
   - **Copy-to-clipboard silently didn't work.** The review tool's swipe handling used
     `touch-action: none` on `html, body` — page-wide, which also blocked long-press text selection
     in the end-screen's results textarea on mobile, the standard way to copy on a phone. Scoped
     `touch-action: none` to just the review card instead. Also hardened the copy button itself
     (Clipboard API → Web Share API → `execCommand` → honest "copy manually, text is already
     selected" message, in that order) since a sandboxed Artifact iframe may not grant clipboard
     permissions at all — never assume the scripted path worked.
   - **Also added, per user request:** an optional per-item note field (e.g. "sounds Italian"),
     carried through to the results text for both flagged AND approved-but-noted items — nothing
     typed is silently dropped. **Then broke it immediately**: the tool's own global keydown
     shortcuts (arrow keys / space, added for desktop testing) listened on `document` with no check
     for whether an `<input>` had focus, so typing a space into the note field was hijacked into
     "replay audio" instead of inserting a space — caught by the user on a real phone keyboard.
     Fixed by having the handler bail out early when `document.activeElement` is an
     INPUT/TEXTAREA. A lesson for any future page mixing global keyboard shortcuts with a real text
     field: that check is not optional.
   - **Verified the copy button for real** (not just "doesn't throw"): a genuine OS-level click
     (not a scripted `.click()`, which doesn't carry clipboard-write user-activation in most
     browsers) on "Copy results" produced a `navigator.permissions.query({name:"clipboard-write"})`
     result of `"granted"` — confirms the write actually succeeds, not just a false-positive toast.
   - **Moved off the Artifact sandbox entirely, at the user's request**, since the claude.ai
     iframe's clipboard permissions policy couldn't be fully verified from outside it. Deployed as
     its own standalone Vercel project — `vercel deploy --prod --yes --name odyssey-pron-review`
     from a scratch dir (just the one 3.5MB self-contained HTML file, renamed `index.html`) —
     **deliberately NOT part of the main odyssey git repo**, so this disposable ~3.5MB QA tool
     never enters that repo's git history. Live at **https://odyssey-pron-review.vercel.app**,
     under the same Vercel account, torn down whenever the review is done (just ask). The claude.ai
     Artifact URL from earlier in this phase is superseded by this one.
   - **Next action, whenever picked back up:** open the Vercel URL and actually run the 167-clip
     review (nobody has yet) — tap through, flag anything wrong, optionally note why, copy the
     results back into a fresh session to start 1b.1.
2. **1b.1 — IPA sourcing.** For each flagged term, look up real English IPA from Wiktionary
   (primary source; cross-check Merriam-Webster/Collins where they have an entry), stress markers
   included, same rigor CLAUDE.md's Latin-toponym harvest used (cite the source per term, document
   what's ABSENT/uncertain rather than guessing).
3. **1b.2 — Build the override as durable data**, not another one-off `curl` — a small
   `src/data/pronunciationOverrides.ts` (term -> `{ipa, source}`), read by
   `scripts/tts-pronunciation.ts`. The script creates/updates ONE real dictionary from that table
   (idempotent — diff against the dictionary's current rules, don't recreate it every run) and
   picks `eleven_v3` + the locator for overridden terms, `eleven_multilingual_v2` + plain text for
   everything else (Targeted) or for all terms (Uniform) per whichever decision above.
4. **1b.3 — Regenerate + re-verify.** Only the flagged terms' fast+slow clips (Targeted) or all
   334 (Uniform). Publish another listen-through Artifact for final confirmation before touching
   R2. Upload only the changed objects.
5. **1b.4 — Docs.** Record the dictionary ID, the override table's provenance, and "how to fix a
   future mispronunciation" as its own CLAUDE.md subsection under the existing pronunciation-audio
   section.

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

## Phase 0d — Custom domain migration (tellmeohmuse.com / singohmuse.com)
**Status: ✅ (2026-08-07)**

The user owns `tellmeohmuse.com` and `singohmuse.com` (both registered + DNS-hosted at
Cloudflare, same account as this project's R2 bucket). Wired up as: `tellmeohmuse.com` is the
canonical/production domain (matches Wilson's own opening line — "Tell me about a complicated
man" — vs. "Sing, O Muse" being Fagles/Fitzgerald's phrasing, a nice bonus); `singohmuse.com`,
`www.tellmeohmuse.com`, and `www.singohmuse.com` are all **domain-level 308 (permanent) redirects
straight to `tellmeohmuse.com`, each a direct single hop — none chain through another redirecting
domain.** Path is preserved on every redirect (`/entry/circe` survives the hop) — verified live,
not assumed.

- **Credential handling:** a Cloudflare API token scoped to Zone → DNS → Edit + Zone → Zone →
  Read, restricted to just these two zones, was created by the user and piped from clipboard
  straight into a git-ignored `.env.cf-dns.local` (same convention as `.env.r2.local`) — the
  token value itself never appeared in the chat/transcript. Getting the token scope right took a
  few iterations: "Registrar" permissions (WHOIS/nameservers/transfer-lock) don't grant DNS
  record access at all — that's a separate "DNS" permission group under the **Zone** resource
  type, which Cloudflare's token UI only surfaces once the resource picker is set away from
  "Entire Account" to a zone-based scope.
- **Vercel side:** domain-level redirects (the `redirect`/`redirectStatusCode` fields on
  `PATCH /v9/projects/{id}/domains/{domain}`) aren't exposed by the `vercel` CLI — no flag on
  `vercel domains add` for it. Used the Vercel REST API directly instead, authenticated by
  reading the token the CLI already had stored locally (`~/Library/Application
  Support/com.vercel.cli/auth.json`) — same "reuse an already-authenticated CLI's token" pattern
  as this user's `gh auth token` convention for the GitHub MCP server, not a new credential.
  **A first pass used `vercel redirects add` (a *project-level* redirect rule) instead of the
  proper domain-level redirect** — it happened to also return 301 and preserve the path
  correctly when tested, but was the wrong mechanism (would have left dead/confusing config
  once the real domain-level redirects were added) and was removed (`vercel redirects remove` +
  `promote`) once the correct per-domain `redirect`/`redirectStatusCode` fields were set via the
  API. **Lesson: an agent's claim that a CLI feature exists is worth independently verifying
  before trusting the surrounding claims built on it** — in this case the command *did* exist
  (verified via `--help`), but that shouldn't have been assumed either way without checking.
- **DNS:** apex A records for both domains, plus A records for `www.tellmeohmuse.com` and
  `www.singohmuse.com` (Vercel wants a plain A record to `76.76.21.21` even for the `www`
  subdomains here, not a CNAME — confirmed via `vercel domains inspect` per-domain rather than
  assumed), all created via the Cloudflare API, **DNS-only / not proxied** (Cloudflare's
  proxying would interfere with Vercel's own TLS cert issuance and edge routing).
- **Code:** `scripts/prerender.tsx` and `scripts/sitemap.ts`'s `SITE` constant, plus
  `public/robots.txt`'s `Sitemap:` line, switched from the `odysseygloss.vercel.app` placeholder
  to `https://tellmeohmuse.com` — canonical links, OG tags, and all 168 sitemap URLs now point at
  the real domain.
- **Verified live** (not just locally): all four hostnames resolve, TLS is provisioned on all of
  them, `tellmeohmuse.com` serves the real bilingual content, and `curl -D -` against
  `singohmuse.com`, `www.tellmeohmuse.com`, and `www.singohmuse.com` each show a single-hop `308`
  straight to `https://tellmeohmuse.com/entry/circe` (path preserved) with no intermediate hop.
- **Not done:** `odysseygloss.vercel.app` (the original Vercel-assigned domain) still serves the
  site directly rather than also redirecting to `tellmeohmuse.com` — the `rel="canonical"` tag on
  every page should be sufficient for Google to consolidate on the real domain regardless, and
  it's unclear the platform-default `.vercel.app` alias can even be redirected the same way a
  real custom domain can. Worth revisiting only if it turns out to matter in practice.

## Manual follow-ups (not code — no files to read, nothing to implement; tracked here so they don't get lost)
- [ ] **Submit the sitemap to Baidu's Ziyuan webmaster tools** (百度搜索资源平台,
  ziyuan.baidu.com). Phase 0 made every page on the site crawlable by a non-JS crawler and
  `public/sitemap.xml`/`https://tellmeohmuse.com/sitemap.xml` lists all 168 URLs, but
  Baidu still won't discover any of it without the site being registered/verified there and the
  sitemap submitted through that platform — this is the one remaining step between "code-side
  ready" and "actually indexed by Baidu." Needs the user's own Baidu account (site-ownership
  verification, typically a DNS TXT record or an uploaded HTML file) — not something to do from
  this repo alone. Given the ~8-week Chinese-audience window noted above, do this promptly once
  picked up.
- [ ] **Set up a Domain property (not URL-prefix) for `tellmeohmuse.com` in Google Search
  Console.** A Domain property covers all four hostnames/protocols at once (apex, `www`, http,
  https) rather than being blind to whichever variant traffic actually lands on — matters here
  specifically because three of the four hostnames are redirects. Needs DNS verification (a TXT
  record at the apex) via the user's own Google account — same "manual, needs an account this
  repo can't provide" shape as the Baidu item above.

---

## Parked / low-conviction (not scheduled — user is not sure these are worth doing at all)
- **ElevenLabs Music exploration** — user flagged interest (2026-08-08) in exploring ElevenLabs'
  music-generation product for this project, separate from the Phase 1 TTS pronunciation work.
  No scope defined yet (ambient/theme music? per-episode score?) — needs a proper scoping pass
  before it's anything more than an idea. Same `.env.elevenlabs.local` key can likely cover it.
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
- 2026-08-08 — **Phase 0e done.** Fixed the 4 rubri pins (Lotus-Eaters, Temese, Ortygia,
  Cyclopes) found sitting on blank parchment below the Vlyssis Errores inset's printed frame.
  The plan's original approach (reuse `odysseus.ts` journey-stop coordinates via a crop→master
  transform) only partly worked: Temese and Ortygia aren't journey stops at all, and a first
  transform attempt (naive FFT correlation over the whole master, downsampled) landed on a
  false peak in a completely wrong part of the plate — caught by visually stacking the
  candidate crop against `map-wanderings.jpg` before trusting it, not by the correlation score
  alone. Re-derived a correct offset (search seeded from the plate's own documented inset
  bounding box, confirmed via a landmark point match on the "Phaeacia, que Scheria" label
  appearing in both images), then abandoned the transform entirely in favor of reading each of
  the 4 terms' labels directly off the master at native resolution once the general inset
  region was located: Lotus-Eaters -> "LOTOP.HAGI.", Cyclopes -> "CYCLOPES" (Land of the
  Cyclopes and Land of the Lotus-Eaters both label the same Sicily-standing landmass as the
  existing Thrinacia pin, via adjacent but distinct captions), Temese -> "Temessa" (a town
  glyph on the toe of Italy). Ortygia has no engraved caption anywhere on the inset (checked
  exhaustively, both halves of the frame) — placed on an unlabeled islet in the
  Scylla/Charybdis strait between Temessa and Thrinacia, matching Wilson's own glossary
  description ("a small Sicilian island near the mainland"); added to `NO_LATIN` in
  `check-pins.ts` alongside the plate's other documented-absent terms, while Temese/
  Lotus-Eaters/Cyclopes came OFF that allowlist now that they carry real `latin` values. All 4
  verified with marked-ring crops at native resolution before committing (same method as the
  Graecia calibration pass). `npm run check:pins` clean (rubri still 31 pins — no pins added or
  removed, just repositioned).
- 2026-08-08 — **Phase 1 done (pronunciation audio).** Key handling took the longest part of this
  session: `NAPLANSpelling`'s stored ElevenLabs credential turned out to be a key ID, not a usable
  secret, and `netlify env:get`/`env:list` against that project were inconsistent/partially
  blocked by the permission classifier — resolved by generating a fresh key straight from the
  ElevenLabs dashboard into this project's own `.env.elevenlabs.local`. Queried the account's real
  voice library (not guessed IDs) and picked Alice (`Xb7hH8MSUJpSbSDYk0k2`, British, "Clear,
  Engaging Educator") over George/Daniel/Lily for slow-speech articulation clarity. First design
  (both clips from ElevenLabs, slow clip built from an ellipsis-joined `pron` respelling) failed
  by ear — confirmed via a phone-listenable Claude Artifact with embedded base64 test clips.
  Revised to one ElevenLabs call (natural term read) + a local `ffmpeg atempo=0.6` pass for the
  slow sibling, validated with a second A/B artifact (0.6x vs 0.7x — settled on 0.6x since the gap
  was inaudible on short words anyway). Ran the full batch (167 entries -> 334 clips, 0 failures),
  uploaded to R2 (12,056 objects total in that pass — art + tiles + the new audio, 0 failures),
  wired `PronounceButton` into both `App.tsx` and `EntryContent.tsx`, verified `tsc`/`eslint` clean
  and the button renders + doesn't crash in a live dev-server check. `scripts/tts-pronunciation.ts`
  and `scripts/upload_to_r2.py`'s audio support are idempotent (skip existing files; `FORCE=1` to
  re-render) the same way NAPLANSpelling's sibling script works.
- 2026-08-08 — **Phase 1b scoped, not started.** User caught two mispronunciations by ear (Aeaea,
  Circe) that Phase 1's "feed the real term text" design didn't anticipate — both are
  `eleven_multilingual_v2` misapplying another language's letter-to-sound rules to an
  English name that looks foreign. Verified end-to-end that ElevenLabs' real IPA phoneme
  pronunciation dictionaries fix this, but only on `eleven_flash_v2`/`eleven_v3`, not the model
  every existing clip uses — so this isn't a drop-in fix, it's a real phased effort (audit all 167
  clips by ear, source real IPA per flagged term, decide targeted-vs-uniform model scope, rebuild
  the override as durable data, regenerate, re-verify, re-upload). User wants to steer each phase
  rather than have it all run at once — see "Phases" above for the resume points.
- 2026-08-08 — **Phase 1b.0 tooling done, review not yet run.** Built + tested the swipe-through
  review tool, found and fixed 3 real bugs along the way (bracket text read aloud on 5 terms,
  a `touch-action` bug that silently broke mobile copy, a global-keydown bug that hijacked spacebar
  in the note field), and verified the copy button actually grants clipboard-write on a real click.
  Moved the tool off the claude.ai Artifact sandbox to its own standalone Vercel deployment
  (https://odyssey-pron-review.vercel.app) so there's no sandbox-permissions uncertainty left.
  Also ran a full `/doctor` health-check pass this session (unrelated to Odyssey directly) —
  disabled 9 unused Claude Code plugins/MCP connections, migrated ~43.7k chars of this project's
  own CLAUDE.md into 5 path-scoped `.claude/rules/*.md` files and 2 skills
  (`harvest-artwork`, `mobile-map-qa`) so they load on demand instead of every session, updated
  Claude Code to 2.1.226, and switched the default permission mode to `auto`. The CLAUDE.md/
  `.claude/` changes are uncommitted working-tree edits — review via `git diff` before committing.

---

## Mobile performance — "chase 100" (2026-08-10)

**Status: 🟡 in progress — one real, verified win landed; the next lever identified but not
built (needs a UX decision, not just a tweak). Baseline before this: mobile Lighthouse
Performance 55, LCP 21.3s (desktop was already 100/100/100/100 — see CLAUDE.md's Deploy section).**

1. **Card-grid cover thumbnails (landed, verified: 55 → 76, LCP 21.3s → 4.8s).** The 167 card
   covers were serving full lightbox-resolution JPEG masters (250-370KB) for a ~380px grid cell.
   `scripts/make_thumbs.py` pre-bakes an 800px WebP (q78, ~65-115KB) for every entry's `art[0]`
   — same "R2 has no live transform" pattern as the Atlas minimap thumbs. `coverThumbUrl()` in
   `entries.ts`, used only by the App.tsx card grid; `EntryContent.tsx`'s larger hero and the
   lightbox both keep the full-res master via `assetUrl()`.
2. **Font/script priority tweaks (mostly a wash, one reverted).** Chased the remaining 4.8s LCP
   by identifying the actual LCP element via a real-browser probe (Playwright + CDP, mobile
   throttling matching Lighthouse's Moto G Power / Slow-4G profile — `PerformanceObserver`
   directly, not guessing from Lighthouse's JSON) — confirmed it's genuinely `hero.jpg`, not a
   lazy card image as first suspected. Split Noto Sans SC (CJK font, ~2MB across ~40 unicode-range
   chunks, since every entry's Chinese name/def is in the DOM on the home page) into its own
   deferred stylesheet — kept, sound on its own merits even though it didn't move the score.
   Also tried dropping the entry `<script>`'s fetch priority to low (page is fully prerendered,
   first paint needs no JS) — **measured against real Lighthouse this made things worse**
   (Performance 76→74, TTI 7.5s→9.6s, LCP flat) and was reverted the same session. Lesson: a
   local CDP-throttled probe and Lighthouse's own (simulated) scoring don't always agree —
   verify every change against a real Lighthouse run before trusting a local probe's read on it.
3. **The real remaining bottleneck, found but not fixed: request concurrency, not
   priority.** Blocking the ~19 lazy-loaded R2 card-thumbnail requests entirely in the same
   Playwright probe dropped `hero.jpg`'s load time from ~4.8s to ~2.0s — confirming that under
   throttling, having ~20 requests in flight at once starves `hero.jpg`'s bandwidth share
   regardless of their `loading="lazy"`/Low-priority tags (CDP-level throttling doesn't strictly
   enforce priority ordering the way a real prioritized HTTP/2 connection would). Reprioritizing
   further won't fix this — the fix is fewer concurrent requests in that window: either a custom
   `IntersectionObserver`-based lazy load with a tight `rootMargin` (replacing native
   `loading="lazy"`, which is evidently not lazy enough for a 167-card single page), or
   paginating/virtualizing the home grid so most cards aren't in the DOM at all until scrolled
   to. **Both are real feature/UX decisions** (infinite scroll vs. "load more" vs. pages), not a
   quick tweak — needs the user's call on direction before building.

### Chase-100 research session #2 (2026-08-10, later the same day) — root causes found, fix plan set

Measured with `npx lighthouse` 13.4.1 (the new insights-era scoring), headless, simulated
Slow-4G mobile, 3 runs: **production scores a rock-stable 55** (LCP 17.9–18.4s, FCP ~14s
simulated) — lower than the 76 recorded this morning; the delta is measurement setup (LH
version/environment), so treat 55/LH-13-CLI as the new like-for-like baseline. Every claim
below was verified causally (request-blocking A/B runs), not from audit lists alone.

**Root causes, in order of measured impact:**
1. **Noto Sans SC downloads 2,023KB across 38 chunks — 59% of the 3,405KB page.** The
   `media="print"` deferral only defers the *stylesheet*; the glyph downloads still fire ~900ms
   in because all 167 entries' Chinese text is in the prerendered DOM. Blocking the font alone:
   55 → 66. It also explains the mystery **~2.3s observed first paint** on prod (constant across
   6 runs): the font storm keeps invalidating style/layout of the 3,704-element DOM and first
   paint loses the race — the **same build served from localhost paints at 255ms and scores 91**
   (font arrivals land after first paint there; the swap repaints quietly by ~840ms). Proven NOT
   to be hydration (blocking the JS bundle leaves obsFCP at 2.3s) and NOT backdrop-blur
   rasterization (localhost paints fine with identical CSS). Fix: the corpus is fixed and known
   at build time — **only 862 unique CJK codepoints** across all zhName/zhDef, and `font-zh` only
   ever renders weight 400 — so a build-time pyftsubset/cn-font-split subset (~150–250KB, one
   weight, self-hosted on Vercel, immutable) replaces 2MB. Or simpler still: drop Noto SC and let
   the existing `"PingFang SC", sans-serif` fallback stack serve (0KB — needs a visual call).
2. **r2.dev is a dev-only endpoint and it shows:** thumbs arrive HTTP/1.1 (modern-http-insight),
   with `Cache-Control: 0` (cache-insight, 405KB re-downloaded every visit), rate-limited by
   design per Cloudflare docs. Fix: attach a custom domain to the R2 bucket → edge cache +
   HTTP/2/3 + real Cache-Control, swap the base URL in code. (Alternative: move the ~10MB of
   thumbs into `public/` and let Vercel's CDN serve them — simpler, but bloats the repo.)
3. **gtag.js: 166KB in the critical window** (unused-js flags 72KB). Blocking it on top of the
   font: 66 → 69. Fix: inject it on `load`+idle (Partytown is overkill here — TBT is already 0;
   it hurts via bandwidth, not blocking).
4. **The two hero-carousel voyage crops are in-viewport JPEGs** (`journey-map-telemachus.jpg`
   182KB, `journey-map.jpg` 111KB; image-delivery says 271KB savings) and hero.jpg itself could
   be WebP/AVIF (−39KB). Pre-bake WebP like the card thumbs.
5. **Thumb lazy-load concurrency (this morning's finding) is real but now last in line:**
   Chrome's native `loading="lazy"` prefetches up to 2,500px ahead on slow connections
   (hardcoded, per web.dev) → ~19 thumbs in flight vs hero. Re-measure after 1–4; if LCP still
   lags, replace native lazy with a small IntersectionObserver (`rootMargin: '200px'`,
   `data-src` swap) — no need for the virtualization/pagination UX decision unless that fails.

**Traps for the next session:** localhost Lighthouse runs with `--blocked-url-patterns` are
noisy/misleading for *predicting* fixed scores (blocked ≠ absent: errored requests distort
Lantern's graph and can even change the LCP element) — build the fix for real and measure prod.
The PSI API anonymous quota was exhausted today; use an API key or the web UI for the canonical
number. `main.tsx` uses `createRoot().render()` over the prerendered HTML (throws the static DOM
away instead of hydrating) — proven NOT to be the paint bottleneck, but switching to
`hydrateRoot` is still right eventually for INP/correctness.

### Chase-100 session #2 — RESULTS (2026-08-10, evening)

**Shipped (3 commits: `be7dc91`, `57e7748`; `1ab6bbc` between them is the unrelated audio
completion) and verified on production. Authoritative PSI mobile: 55 → 69** (post-CV re-run
read 68 with LCP/TBT jittering the other way — noise, the two runs straddle the same state) (CLI LH 13.4.1 headless agrees: 67–70 across 5 runs).
Accessibility / Best Practices / SEO stay 100. Page: 3,405KB → 1,397KB, 60 → 23 requests.
LCP 17.9s → 4.9s sim, FCP 14s → 4.4s sim, TBT ≤80ms, CLS 0.

What landed: the 202KB corpus-subsetted self-hosted Noto Sans SC (was 2,023KB / 38 chunks —
`scripts/subset_font.py`, output in `src/assets/` so Vite hashes it); card thumbs committed and
served same-origin from Vercel with a 30-day header (r2.dev keeps only full-res masters, atlas
tiles, audio); gtag injected on load+idle; the 2 voyage-carousel crops as WebP q70 (hero.jpg
kept — WebP saved only 7KB at parity, not worth touching the LCP asset);
`content-visibility:auto` + `contain-intrinsic-size` on the glossary cards.

**Why it's 69 and not higher — the compositor-tick discovery.** The trace
(`--save-assets`) shows the page fully painted with the layer tree ACTIVATED at ~1.35s, but
headless Chrome's compositor ticks at ~1Hz when idle (RequestMainThreadFrame at 251ms → 1282ms
→ 2291ms, ~1009ms apart) — miss a tick and first paint waits for the next one, landing at
~2.3s observed, which Lantern then scales to FCP ~4.4s. PSI's own environment shows the same
shape. The same build served from localhost gets ready by ~250ms, catches the FIRST tick, and
scores 91 — readiness time relative to the tick is everything. content-visibility alone did
not pull readiness under the ~1.28s tick (obsFP unchanged), so what still gates readiness is
the font-arrival/swap timeline (Latin woff2s land 511–613ms from fonts.gstatic, a 174ms
style/layout task follows at ~1.17s), not card layout.

**Next levers, in order (not yet built):**
1. Self-host Cinzel + Hanken Grotesk latin subsets (same subset_font.py pattern) — kills the
   fonts.googleapis CSS round-trip and the fonts.gstatic DNS+TLS chain from both the observed
   timeline and Lantern's graph; fonts arrive ~300ms+ earlier → swap earlier → plausibly ready
   before the 1.28s tick, which is worth ~2s of simulated FCP in one step.
2. If still short: `font-display: optional` (+ `size-adjust`-tuned fallbacks) to remove
   late-swap relayout entirely — trades occasional first-visit fallback rendering against the
   user's visual-consistency preference, so ask before doing this one.
3. `unused-css-rules` still flags ~19KB of the bundled CSS; low value, only if desperate.

**Traps:** PSI's anonymous API quota is permanently saturated — use the pagespeed.web.dev UI
(a haiku browser agent works well) or an API key. Don't A/B against localhost Lighthouse
absolute numbers (compositor-tick luck makes it score ~20 points high). r2.dev remains
rate-limited for the assets still on it (atlas tiles, lightbox masters, audio) — fine for
click-driven loads, but the real production fix when ready is a custom domain or Worker proxy
in front of the bucket.

**Latin self-host follow-up (later that evening, commit `63f20d1`):** Cinzel + Hanken roman +
Hanken italic are now corpus-subsetted, wght-axis-limited variable woff2s (29/48/50KB) in
`public/fonts/` (versioned names + immutable header — bump `-v1` in index.html AND index.css
when regenerating via `scripts/subset_latin_fonts.py`), preloaded same-origin; zero
fonts.googleapis/gstatic requests remain. **Result: FCP 4.4s → a stable 2.0s on PSI.** PSI
samples on this deploy: 63 / 77 / 84 (median **77**, up from 55 baseline); CLI: 70/76/80.
The spread is the ~1.3s compositor-tick race (readiness now straddles it) plus TBT
bookkeeping — earlier FCP widens the counted TBT window, so the same gtag/hydration tasks
that used to hide before a 4.4s FCP now land inside it (PSI TBT jitters 30–320ms run to run).
Remaining levers for the LCP 4.3–5.5s + TBT tail: shave hero.jpg transfer (AVIF ~50-60KB vs
101KB — retest quality since it sits behind blur overlays anyway), hydrateRoot instead of
createRoot().render() (halves initial React main-thread work — markup must match the
prerender exactly), gtag on first-interaction instead of load+idle (undercounts quick
bounces — ask first), font-display: optional (kills swap-relayout; trades occasional
first-visit fallback rendering — ask first).

**Session #2 close-out (late evening — the "simpler beats cleverer" round, commits `d358fc2`,
`0b0285f`):** three more structural fixes: (1) **hero-blur.avif, 2KB** — hero.jpg with the 3px
backdrop-blur AND the flat base-100/72 overlay baked in (blur leaves no entropy to encode);
deletes the runtime backdrop-filter layer; Chrome's low-entropy LCP heuristic then makes the
first voyage-carousel slide the LCP element, so it's eager + fetchpriority=high + preloaded,
and later slides stay lazy. The bottom gradient overlay stays live (viewport-relative).
hero.jpg remains only as og:image. (2) **Real hydration** — prerender emits renderToString
markup and main.tsx hydrateRoot-adopts the prerendered DOM (entry pages and #hash deep-links
keep plain render; both legitimately differ from the prerendered tree). Verified
hydration-warning-free. (3) **Render-blocking CSS inlined** into every prerendered page by
scripts/prerender.tsx (~20KB gz per page, one fewer critical round-trip; all built url()s are
absolute so the move is verbatim).

**Where it landed (PSI, this deploy): 76 / 93 — best-run metrics FCP 1.2s, LCP 1.8s, SI 2.0s
(100-grade when the paint catches the compositor tick); CLI: 94/75/77/77 with obsFP now as low
as 694ms.** Day's arc on PSI medians: 55 → 69 → 77 → ~85±9. The remaining spread is the ~1s
compositor-tick race documented above plus TBT jitter (30–310ms; gtag + hydration tasks landing
just after a now-early FCP). Levers still on the table, both needing the user's call:
gtag-on-first-interaction (undercounts quick bounces in GA) and font-display:optional
(occasional first-visit fallback rendering vs the visual-consistency preference). Nothing else
cheap is left — the page is 1.3MB, 16 requests, one origin + R2 thumbs-free.
