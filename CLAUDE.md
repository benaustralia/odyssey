# The Odyssey — An Illustrated Glossary

A bilingual (English · 简体中文 · Pīnyīn) illustrated glossary of 84 entries from Homer's
*Odyssey* (Emily Wilson translation, W. W. Norton), each paired with public-domain or
openly-licensed artwork.

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
- `src/data/art.json` — `{ key: { file, artist, title, year, source, license? } }`. `file` lives in `public/art/<key>.jpg`. `license` is only set for non-PD (CC) images.
- `categoryOf(tag)` maps tags → 4 filter categories: **gods** (god\*), **monsters** (monster), **mortals** (person/hero/people/animal), **world** (place/thing/idea/trick). Filter labels: Gods · Mortals · Monsters · **World**.

## Captions / licensing
- Caption format (YARL `description`): `Artist · Title, year`, with graceful omission; CC images append the license (e.g. `CC BY 4.0`). **English titles only** — foreign/messy/catalogue titles were stripped.
- Footer says "public domain or openly licensed (CC)". Sourced from Wikimedia Commons. Accept PD / CC0 / CC-BY / CC-BY-SA only.

## Working with artwork (lessons learned)
- Fetch scripts query the Commons API (`generator=search`, `prop=imageinfo`, `iiprop=url|mime|extmetadata`). **Filter aggressively:** skip `.pdf/.djvu/.svg`, book scans (`(IA `, "Adventures of Ulysses"), maps, logos, and species/astronomy named after Greek figures (butterflies like *Morpho menelaus* / *Eumaeus atala*, planet "Saturn with auroras"), film stills, perfumery signs, "goddess card" composites.
- After fetching: build a contact-sheet montage with ImageMagick and eyeball it; check for cross-language duplicate works (same painting filed under English + French/German/Dutch names — dedupe, keep English).
- A greedy "cover diversification" pass reorders each entry's `art` so covers are unique where alternatives exist.
- Shell here is **zsh** (no `mapfile`/bash array slicing) — use Python for montages/scripts.

## Deploy
`npm run build` then `vercel --prod --yes` (or just `git push` — auto-deploys). Lighthouse target was 100/100/100/100 (achieved locally; production perf varies with network).

## TODO / open items
1. **Thin out over-used images — DONE.** Every card **cover is now unique**. Hayez 4×→1×; Pinturicchio 7×→1×; Kleophrades vase 3×→1× (Demodocus→Flaxman, Phemius→Flaxman, bard keeps the vase); Pylos fresco 2×→1× (Nestor→Meleager-Painter vase). Remaining ×2 cases are all cover-plus-secondary (the image is one card's cover and another's 2nd slide, so it appears once on the grid) and several are deliberate (Scylla & Charybdis share the same "Odysseus between Scylla and Charybdis"; Helen/Sparta; Poseidon/Ino). Method that worked: pull images from the relevant Wikipedia article via `action=query&generator=images&prop=imageinfo&iiprop=url|mime|extmetadata`, filter to PD/CC.
2. **More modern art.** Infra supports CC; only 2 CC images so far. Relevant 20th–21st-c. Odyssey art is sparse on open repos — best added by naming specific artists/works.
3. A few minor-character entries still share scenes for lack of unique art.
4. Optional: masthead `ΟΔΥΣΣΕΙΑ` is redundant with "The Odyssey" (could become `ΟΜΗΡΟΥ` / be removed).

## Sister project
`~/Documents/smell/web` → Vercel project `smellcombo`, live at https://smellcombo.vercel.app (Next.js; needs `vercel.json` with `{"framework":"nextjs"}`).
