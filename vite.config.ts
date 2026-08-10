import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite's HTML transform drops unrecognized attributes (fetchpriority) when it
// rewrites the entry <script>'s src to the hashed bundle path, so it has to be
// re-added post-transform. Every page (home + all 167 entries) is fully
// prerendered static HTML (scripts/prerender.tsx) — first paint needs no JS
// at all, so the bundle competes for bandwidth with the LCP image for no
// benefit on a throttled connection. See Plan.md.
function deprioritizeEntryScript() {
  return {
    name: "deprioritize-entry-script",
    transformIndexHtml(html: string) {
      return html.replace(
        /(<script type="module"[^>]*)(><\/script>)/,
        '$1 fetchpriority="low"$2'
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), deprioritizeEntryScript()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
})
