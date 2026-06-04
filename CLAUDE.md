# The Odyssey — An Illustrated Glossary

A bilingual (English · 简体中文 · Pīnyīn) illustrated glossary of **160 entries** from Homer's
*Odyssey* (Emily Wilson translation, W. W. Norton) — incl. **84 places** (every place in Wilson's
glossary). Paired with public-domain / openly-licensed artwork: **492 unique artworks** (deduped by
source AND by perceptual hash so no image repeats) plus **6 shared antique maps**.

- **Live:** https://odysseygloss.vercel.app (Vercel project `odysseygloss`, native domain, auto-deploys on push to `main`)
- **Repo:** github.com/benaustralia/odyssey
- **Final study PDF** (separate deliverable): `~/Desktop/Odyssey Student Packet (final).pdf`

## Stack & hard conventions
- **React + Vite + TypeScript.**
- **DaisyUI only** for UI (theme locked to `dracula`). No shadcn, no Radix, **no hand-written CSS classes** — `src/index.css` is just the Tailwind import, the DaisyUI plugin, font tokens, and a body font-family. Use DaisyUI components + standard Tailwind utilities only.
- **Image viewer:** `yet-another-react-lightbox` (YARL) with Thumbnails, Captions, Zoom, Fullscreen plugins. Do NOT rebuild a carousel by hand — that caused many bugs.
- **Fonts:** `Cinzel` (serif) for the hero masthead ONLY; `Hanken Grotesk` (sans) everywhere else; `Noto Sans SC` for Chinese. Loaded async in `index.html`; Cinzel latin woff2 is preloaded.
- Almost all logic lives in `src/App.tsx` (single component).

## Data model
- `src/data/glossary.json` — array of entries: `{ term, pron, tag, def, zhName, zhPinyin, zhDef, art: string[] }`. `art` is an ordered list of keys into art.json; `art[0]` is the card cover.
- `src/data/art.json` — `{ key: { file, artist, title, year, source, license?, cld } }`. `cld` is the Cloudinary public_id (delivery). `file` (`/art/<key>.jpg`) is a legacy/fallback path only. `license` is only set for non-PD (CC) images.
- `categoryOf(tag)` maps tags → 4 filter categories: **gods** (god\*), **monsters** (monster), **mortals** (person/hero/people/animal), **world** (place/thing/idea/trick). Filter labels: Gods · Mortals · Monsters · **World**.

## Captions / licensing
- Caption (see `slides` in `App.tsx`): **both** the credit (`Artist · Title, year` + license for CC) and the optional `note` go in the YARL slide **`description`** (credit line, then `<br/>`, then note), and the slide **`title` is left empty on purpose** — YARL renders `title` in the top toolbar with `white-space:nowrap;text-overflow:ellipsis`, so it truncated on mobile. `description` wraps (set `descriptionMaxLines:5`). Graceful omission throughout.
- The `note` is a short subject locator/clarifier — locate the subject in a multi-figure work ("Ajax — the warrior at right (inscribed AIANTOS)") or explain an indirect-but-valid connection ("The Titans — Cronus's kin — cast down by the Olympians"). Written by viewing each image (vision pass); conservative (blank when single-figure/obvious/uncertain). **282 of 500** images have a `note`; **105** are CC-licensed. **English titles only** — foreign/messy/catalogue titles were stripped. **All** titles (harvested + originals) were standardised: translated to English, museum/inventory/accession noise removed, truncations/"artist-as-title"/book-scan prefixes fixed, Title Case; `artist` fields scrubbed of Commons uploader/photographer handles (kept real painters + vase-painter conventions; blanked anonymous ancient works). Re-standardise from the `source` filename (ground truth) — the stored `title` was sometimes lossy/truncated.
- **Places & maps:** all 84 places (from Wilson's glossary) are `tag: "place"` → **World** filter. Each is illustrated by one of **6 antique PD maps** (Ortelius *Wanderings of Ulysses* & *Aegyptus Antiqua*, Lapie *Voyages*, *Graecia Homerica*, Delisle *Northern Greece*, *The World according to Homer*), `public/art/map-*.jpg`. A map is **shared across the many places it contains**: each place has its own art record keyed `<slug>-map` that reuses the map's `cld` but carries its own locating `note` ("Chios — an Aegean island off the coast of Asia Minor"). So maps are the ONE deliberate exception to image-uniqueness — exclude `*-map` keys from both the source-dedup and perceptual-dup checks.
- **Perceptual-dup check (tool):** beyond source-filename dedup, the same artwork sometimes exists as two different files (low-res caption-baked vs clean high-res). Detect with a PIL dHash+aHash sweep over `public/art/*.jpg` (restrict to live art.json keys, skip `map-*`); pairs with dHash≤12 & aHash≤18 are candidates — VIEW a side-by-side montage to confirm (dark images throw false positives), keep the higher-res/caption-free copy. Re-run after big harvests.
- **Dedup invariant:** every NON-MAP image appears once. Enforced by grouping on the `source` Commons filename and keeping a single key per group, **preferring the one that is some entry's cover** so no card cover is orphaned. Re-run after any harvest. Note: deduped images may remain as orphan assets in the Cloudinary `odyssey` folder (delete separately).
- Footer says "public domain or openly licensed (CC)". Sourced from Wikimedia Commons. Accept PD / CC0 / CC-BY / CC-BY-SA only.

## Working with artwork (lessons learned)
- Fetch scripts query the Commons API (`generator=search`, `prop=imageinfo`, `iiprop=url|mime|extmetadata`). **Filter aggressively:** skip `.pdf/.djvu/.svg`, book scans (`(IA `, "Adventures of Ulysses"), maps, logos, and species/astronomy named after Greek figures (butterflies like *Morpho menelaus* / *Eumaeus atala*, planet "Saturn with auroras"), film stills, perfumery signs, "goddess card" composites.
- After fetching: build a contact-sheet montage with ImageMagick and eyeball it; check for cross-language duplicate works (same painting filed under English + French/German/Dutch names — dedupe, keep English).
- A greedy "cover diversification" pass reorders each entry's `art` so covers are unique where alternatives exist.
- **Full-article harvest (done):** pulled *every* PD/CC image off each entry's en.wikipedia article (`generator=images`), keyed `<slug>-w<NN>`. This sweeps in junk that `generator=images` can't pre-filter — maps, coins, site/building/landscape photos, Britannica diagrams, book-plate scans, museum replicas, ritual photos, a fossil skull, and **off-subject gallery/navbox thumbnails** (e.g. Bernini's *Apollo & Daphne* landed on Ajax). The original Commons filename lives in the `source` field (the on-disk `file` is renamed) — QA by dumping `source` basenames + a contact-sheet montage, then prune. 32 were pruned this round.
- **Image weight:** local masters in `public/art` are recompressed to `-resize '1600x1600>' -quality 82 -interlace Plane -sampling-factor 4:2:0 -strip` before upload.
- **Relevance + caption audit (done):** a vision pass over *every* image (subagents that actually open each `public/art/<key>.jpg`) checking (a) is it on-subject for its entry, (b) is the caption helpful. `generator=images` pulls tangential article images that *look* fine by filename but are off-subject — e.g. Blake's *Comus* on Circe, *School of Athens* on hospitality, a "Marlowe" portrait on Helen, a Theseus/Minotaur cup on Hades. **Removed off-subject; never trust the title alone — verify by viewing.** Also killed unusable images (dense scholarly "Nekyia reconstruction" you can't zoom) and same-scene duplicates (kept the clearer one — e.g. Lykaon Painter vase over van Thulden's *Burning of Elpenor*). Be conservative: keep if it plausibly relates; a clarifying `note` often beats removal for indirect connections.
- **Ajax is two people:** "Ajax the Great" (Telamonian; Book 11 underworld shade) and "Ajax the Lesser" (Locrian, son of Oïleus; Book 4 drowning, the Cassandra outrage) are separate entries. Don't mix their art.

## Image hosting (Cloudinary)
- All images are served from **Cloudinary** — cloud `dhvvz91bh`, asset folder `odyssey`. `public/art/` is **git-ignored** (kept locally only as the upload master / for re-sync); it is NOT deployed. `public/hero.jpg` stays in the repo (LCP preload).
- App delivers via `cldUrl(a, w)` in `App.tsx`: `…/image/upload/f_auto,q_auto,c_limit,w_${w}/${a.cld}` (AVIF/WebP, auto quality). Covers use `w_800`, lightbox `w_1600`.
- **Credentials:** `CLOUDINARY_URL` lives in `~/Documents/wallpapers-1850s/.env`; the `cld` CLI is in that project's `.venv` (`wallpapers-1850s/.venv/bin/cld`). This env uses **dynamic folders**, so uploads get *random* public_ids — the filename is stored as `display_name`.
- **Re-sync after adding/changing images:**
  1. `cd ~/Documents/wallpapers-1850s && export CLOUDINARY_URL=$(grep ^CLOUDINARY_URL= .env | cut -d= -f2-)`
  2. `.venv/bin/cld sync --push ~/Documents/odyssey/public/art odyssey -w 16`
  3. Map `display_name → public_id` via `cloudinary.search` (`expression("asset_folder=odyssey")`, paginate `next_cursor`) and write the `cld` field into `art.json` (see the one-off script used in git history).
- **Orphan cleanup after removals:** removing an image from `art.json` leaves its Cloudinary asset unused. To delete orphans: list all `public_id`s in `asset_folder=odyssey` (paginated search), subtract the set of `cld` values still referenced in `art.json`, then `cloudinary.api.delete_resources(orphans)` (batches of 100). Verify with `resources_by_ids` that 0 *referenced* ids went missing. The search index is eventually-consistent, so the folder count lags deletes by a few minutes — confirm via a delivery-URL 404 instead. **Requires explicit user OK each time** (mass cloud-delete is gated by the safety classifier).
- Shell here is **zsh** (no `mapfile`/bash array slicing) — use Python for montages/scripts.

## Deploy
`npm run build` then `vercel --prod --yes` (or just `git push` — auto-deploys). Lighthouse target was 100/100/100/100 (achieved locally; production perf varies with network).

## TODO / open items
1. **Thin out over-used images — DONE.** Every card **cover is now unique**. Hayez 4×→1×; Pinturicchio 7×→1×; Kleophrades vase 3×→1× (Demodocus→Flaxman, Phemius→Flaxman, bard keeps the vase); Pylos fresco 2×→1× (Nestor→Meleager-Painter vase). A later global-dedup pass then removed *all* remaining cross-entry duplicates too (incl. the former "deliberate" shares like Scylla/Charybdis, Helen/Sparta, Poseidon/Ino), so the **every-image-appears-once invariant now holds absolutely** — keep it that way. Method that worked: pull images from the relevant Wikipedia article via `action=query&generator=images&prop=imageinfo&iiprop=url|mime|extmetadata`, filter to PD/CC.
2. **Curated additions (done June 2026):** Burne-Jones *Wine of Circe* (Circe), Primaticcio *Ulysses and Penelope* (Penelope), two Esquiline *Odyssey Landscapes* Underworld panels (Tiresias = the shades; Hades = the punished), the Sperlonga *Scylla Group* (Scylla), and a PD frame from *L'Odissea* (1911 film) → Cyclops. Modern film stills/posters stay excluded (copyrighted). The PD-only screen source is *L'Odissea* (1911), on Commons as a webm — pull frames with ffmpeg.
3. A few minor-character entries still share scenes for lack of unique art.
4. Optional: masthead `ΟΔΥΣΣΕΙΑ` is redundant with "The Odyssey" (could become `ΟΜΗΡΟΥ` / be removed).

## Sister project
`~/Documents/smell/web` → Vercel project `smellcombo`, live at https://smellcombo.vercel.app (Next.js; needs `vercel.json` with `{"framework":"nextjs"}`).
