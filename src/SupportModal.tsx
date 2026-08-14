import { useEffect, useRef } from "react"
import { Heart } from "lucide-react"

export const STRIPE_DONATE_URL = "https://buy.stripe.com/cNi00iaA3biI6wx96HabK00"

// A modal, not a scroll-to-anchor card: it matches how JourneyMap/AtlasMap/
// the Lightbox already open on this site (click a nav button, get an
// overlay), and it sidesteps scroll-into-view entirely — no dependency on
// page length or DOM-commit timing (that class of bug lived here before).
// Unlike the old Ko-fi iframe, Stripe's hosted Checkout page refuses to be
// framed (it sends its own frame-busting headers), so this modal is just a
// short confirmation panel before a normal top-level navigation to Stripe —
// same tab, so Stripe's post-payment redirect lands the visitor back here.
export function SupportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  if (!open) return null

  return (
    <div className="modal modal-open" role="dialog" aria-label="Support this project">
      <div className="modal-box max-w-md">
        <button
          ref={closeRef}
          type="button"
          className="btn btn-circle btn-ghost btn-sm absolute right-3 top-3"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="flex flex-col items-center text-center">
          <Heart className="size-6 text-primary" aria-hidden="true" />
          <h2 lang="en" className="mt-2 font-heading text-2xl font-semibold">
            Support this project
          </h2>
          <h2 lang="zh" className="font-zh text-xl font-semibold opacity-90">
            支持这个项目
          </h2>
          <p lang="en" className="mt-3 max-w-sm leading-relaxed opacity-90">
            Tell Me, O Muse is free and always will be. If it has been useful to you, a one-off
            or monthly contribution helps cover hosting and the time spent researching entries.
          </p>
          <p lang="zh" className="font-zh mt-1 max-w-sm leading-relaxed opacity-90">
            《Tell Me, O Muse》始终免费开放。如果它对你有帮助，欢迎一次性捐助或按月支持，用于分担网站运行费用与词条研究的时间成本。
          </p>
          <a
            href={STRIPE_DONATE_URL}
            className="btn btn-primary mt-5 gap-2"
          >
            <Heart className="size-4" aria-hidden="true" />
            Donate <span lang="zh" className="font-zh">· 捐助</span>
          </a>
          <p className="mt-3 text-xs opacity-60">You'll be taken to Stripe's secure checkout.</p>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  )
}
