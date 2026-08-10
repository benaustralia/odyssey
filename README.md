# The Odyssey — An Illustrated Glossary

A bilingual (English · 简体中文 · Pīnyīn) illustrated glossary of the names, places,
monsters and ideas in Homer's *Odyssey*, based on the **Emily Wilson** translation
(W. W. Norton). Entries are paired with public-domain and openly-licensed artwork —
Turner, Waterhouse, Klimt, Botticelli, Draper and more — and every place is pinned on
a 16th-century Ortelius map.

Built as a study companion for ESL students.

**Live:** https://tellmeohmuse.com (also singohmuse.com; odysseygloss.vercel.app redirects here)

Made by **Ben Hinton** — questions, corrections and ideas welcome: [bahinton@gmail.com](mailto:bahinton@gmail.com).

## What's in it
- **167 entries**, 91 of them places, each bilingual with a pronunciation guide.
- **Two interactive maps**, both code-split so Leaflet stays out of the initial bundle:
  - **The Journey of Odysseus** (`#journey`) — the 15 stops of the voyage on Ortelius's
    *Vlyssis Errores* (1597), with a narrative sea route and a guided tour.
  - **The Atlas** (`#atlas`) — six Ortelius plates as tiled zoom pyramids, with a pin for
    every place in the glossary. Place cards deep-link straight to their pin.

## Stack
- React + Vite + TypeScript
- **DaisyUI** (theme `dracula`) + Tailwind CSS v4 — no shadcn, no Radix
- `yet-another-react-lightbox` for the image viewer; `leaflet` + `react-leaflet` for the maps
- Images and map tiles served from Cloudflare R2

## Develop
```bash
npm install
npm run dev          # ports 5173/5174 are often taken; check the Vite log
npm run check:pins   # data guard for map pins, journey stops and place coverage
npm run build
```

Contributor notes, conventions and the hard-won gotchas live in `CLAUDE.md`.

---
Artworks: public domain or openly licensed (CC), via Wikimedia Commons.
