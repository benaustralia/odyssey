import { useState } from "react"
import { Volume2 } from "lucide-react"
import { type Entry, audioUrls } from "@/lib/entries"

// Plays the slow syllable-walk clip, then the natural-speed clip, back to
// back. Shared between App.tsx's cards and EntryContent.tsx's page so the
// two render paths can't drift — see Plan.md Phase 1.
export function PronounceButton({ entry, className }: { entry: Entry; className?: string }) {
  const [playing, setPlaying] = useState(false)

  const play = (ev: React.MouseEvent) => {
    ev.stopPropagation()
    if (playing) return
    setPlaying(true)
    const { slow, fast } = audioUrls(entry)
    const stop = () => setPlaying(false)
    const slowAudio = new Audio(slow)
    slowAudio.addEventListener("error", stop)
    slowAudio.addEventListener("ended", () => {
      const fastAudio = new Audio(fast)
      fastAudio.addEventListener("ended", stop)
      fastAudio.addEventListener("error", stop)
      fastAudio.play().catch(stop)
    })
    slowAudio.play().catch(stop)
  }

  return (
    <button
      type="button"
      title={`Hear "${entry.term}" pronounced`}
      aria-label={`Play pronunciation of ${entry.term}`}
      onClick={play}
      disabled={playing}
      className={`btn btn-ghost btn-xs btn-circle ${playing ? "text-primary animate-pulse" : ""} ${className ?? ""}`}
    >
      <Volume2 className="size-3.5" aria-hidden="true" />
    </button>
  )
}
