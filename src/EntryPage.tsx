import { EntryContent } from "./EntryContent"
import { bySlug } from "@/lib/entries"

// Client-side wrapper for the live SPA (mounted by main.tsx when the
// pathname is /entry/<slug>). scripts/prerender.tsx renders EntryContent
// directly instead — it already knows the entry, and doesn't need the
// not-found branch since it only ever generates real slugs.
export function EntryPage({ slug }: { slug: string }) {
  const entry = bySlug.get(slug)

  if (!entry) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-base-100 text-base-content">
        <p className="font-heading text-2xl italic opacity-80">No entry at this address.</p>
        <a href="/" className="btn btn-sm btn-primary">
          Back to the glossary
        </a>
      </div>
    )
  }

  return <EntryContent entry={entry} />
}
