import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { EntryPage } from './EntryPage.tsx'

// Two page shapes, dispatched by pathname at boot rather than a router
// library — /entry/<slug> is a standalone page (scripts/prerender.tsx
// generates its static HTML at build time), everything else is the existing
// SPA untouched. A full navigation between the two is fine: nobody needs
// client-side transitions from a search-engine landing page to the app.
const entryMatch = window.location.pathname.match(/^\/entry\/([a-z0-9-]+)\/?$/)

const root = document.getElementById('root')!

if (entryMatch) {
  // Entry pages are prerendered with renderToStaticMarkup (no hydration
  // markers) and their prerendered shape (crawler-oriented EntryContent)
  // differs from the client EntryPage chrome anyway — plain render.
  createRoot(root).render(
    <StrictMode>
      <EntryPage slug={entryMatch[1]} />
    </StrictMode>,
  )
} else if (window.location.hash) {
  // Deep links (#atlas/…, #journey/…) legitimately open a map modal the
  // prerendered HTML doesn't contain — hydrating would mismatch and fall
  // back to a noisy client re-render anyway, so just render.
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} else {
  // The common case: adopt the prerendered 167-card DOM instead of tearing
  // it down and rebuilding it (what createRoot().render() did — the
  // largest main-thread block in the TBT window; Plan.md chase-100
  // session #2). Prerender uses renderToString for this page so the
  // hydration markers exist.
  hydrateRoot(
    root,
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
