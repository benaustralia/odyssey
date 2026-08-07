// Regenerates the sitemap to list every real URL on the site (home + all
// 167 entry permalinks), not just "/". Baidu in particular needs this: its
// crawler doesn't execute JS, so it can't discover entry pages by following
// links rendered on the (still client-rendered) home page — the sitemap is
// the one place it can find them all directly.
//
// Writes to BOTH public/sitemap.xml (kept in the repo, matches what `git
// status` shows) and dist/sitemap.xml (the actually-deployed copy) — `vite
// build` copies public/ into dist/ at the START of the build, before this
// script runs, so writing dist/sitemap.xml too is what makes the deployed
// file reflect this run rather than whatever was last committed.
import { writeFileSync, existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { entries } from "../src/lib/entries"
import { slugify } from "../src/lib/slug"

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const SITE = "https://tellmeohmuse.com"

const urls = [SITE + "/", ...entries.map((e) => `${SITE}/entry/${slugify(e.term)}`)]

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n") +
  `\n</urlset>\n`

writeFileSync(join(ROOT, "public", "sitemap.xml"), xml)
if (existsSync(join(ROOT, "dist"))) writeFileSync(join(ROOT, "dist", "sitemap.xml"), xml)

console.log(`sitemap: wrote ${urls.length} URLs to public/sitemap.xml${existsSync(join(ROOT, "dist")) ? " + dist/sitemap.xml" : ""}`)
