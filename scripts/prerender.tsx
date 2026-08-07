// Static-generates one HTML file per glossary entry, PLUS the home page
// itself, at build time — so crawlers (especially Baidu, which doesn't
// execute JS at all) see the real English + Chinese text with zero JS
// required. Deliberately NOT a headless-browser prerender (no Puppeteer):
// EntryContent is a pure component with no window/document access, so
// react-dom/server's renderToStaticMarkup can render it directly here —
// faster, and avoids depending on a Chromium binary being available in the
// Vercel build container. App itself turns out to be safely SSR-able too:
// its only window-dependent state (the two map hash routes) already guards
// on `typeof window !== "undefined"` (for the client's initial-hash read),
// so in Node it just resolves to null and those Suspense-wrapped map
// modals never attempt to render — confirmed empirically before wiring
// this in, not assumed.
//
// Both are loaded through Vite's own SSR module graph (vite.ssrLoadModule),
// not a plain tsx/Node import, because their import chain reaches
// mapRoutes -> data/journeys -> odysseus.ts, which imports .svg assets for
// the tour ship icon (see CLAUDE.md's note on journeys/aliases.ts existing
// for this exact reason). Plain Node has no loader for that; Vite's dev
// pipeline already knows how to turn a `.svg` import into a URL string, the
// same way the client build does. entries/slug don't touch that import
// chain, so they load directly.
// Run via `tsx scripts/prerender.tsx` AFTER `vite build` — it reuses
// dist/index.html as the template for both the home page and each entry's
// <head>/script tags.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { createServer } from "vite"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { entries, artsOf } from "../src/lib/entries"
import { slugify } from "../src/lib/slug"

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const DIST = join(ROOT, "dist")
const SITE = "https://odysseygloss.vercel.app"
const R2_ASSETS = "https://pub-b57180e24c9841f58854ecd1c164523a.r2.dev"

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

const template = readFileSync(join(DIST, "index.html"), "utf-8")

const vite = await createServer({ root: ROOT, server: { middlewareMode: true }, appType: "custom" })
const { EntryContent } = await vite.ssrLoadModule("/src/EntryContent.tsx")
const { default: App } = await vite.ssrLoadModule("/src/App.tsx")

// Home page: same template, no per-page <head> rewrite needed (the static
// title/description in index.html are already the site-level generic
// ones) — just the default unfiltered 167-card grid rendered into #root.
const homeBody = renderToStaticMarkup(createElement(App))
const homeHtml = template
  .replace("</head>", `    <link rel="canonical" href="${SITE}/" />\n  </head>`)
  .replace('<div id="root"></div>', `<div id="root">${homeBody}</div>`)
writeFileSync(join(DIST, "index.html"), homeHtml)
console.log("prerender: wrote the home page (dist/index.html)")

let written = 0
for (const entry of entries) {
  const slug = slugify(entry.term)
  const url = `${SITE}/entry/${slug}`
  const title = `${entry.term} (${entry.zhName}) · The Odyssey — An Illustrated Glossary`
  // Bilingual on purpose: Google's audience reads the English half, Baidu's
  // reads the Chinese half, and both crawlers see the whole tag either way.
  const description = `${entry.def} ${entry.zhName}：${entry.zhDef}`.slice(0, 300)
  const cover = artsOf(entry)[0]
  const ogImage = cover ? `${R2_ASSETS}${cover.file}` : `${SITE}/hero.jpg`

  const bodyHtml = renderToStaticMarkup(createElement(EntryContent, { entry }))

  let html = template
  html = html.replace(
    /<title>.*?<\/title>/s,
    `<title>${escapeHtml(title)}</title>`,
  )
  html = html.replace(
    /<meta name="description" content=".*?" \/>/s,
    `<meta name="description" content="${escapeHtml(description)}" />`,
  )
  html = html.replace(
    "</head>",
    `    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${ogImage}" />
  </head>`,
  )
  html = html.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`)

  const outDir = join(DIST, "entry", slug)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, "index.html"), html)
  written++
}

await vite.close()
console.log(`prerender: wrote ${written} entry pages to dist/entry/<slug>/index.html`)
