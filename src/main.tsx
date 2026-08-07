import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { EntryPage } from './EntryPage.tsx'

// Two page shapes, dispatched by pathname at boot rather than a router
// library — /entry/<slug> is a standalone page (scripts/prerender.tsx
// generates its static HTML at build time), everything else is the existing
// SPA untouched. A full navigation between the two is fine: nobody needs
// client-side transitions from a search-engine landing page to the app.
const entryMatch = window.location.pathname.match(/^\/entry\/([a-z0-9-]+)\/?$/)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {entryMatch ? <EntryPage slug={entryMatch[1]} /> : <App />}
  </StrictMode>,
)
