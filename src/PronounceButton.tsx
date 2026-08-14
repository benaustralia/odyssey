import { useState } from "react"
import { Volume2 } from "lucide-react"
import { type Entry, audioUrl } from "@/lib/entries"

// Single natural-speed clip — no slow/fast sequence (Plan.md: mixing a
// synthetic-then-human pair in one button press within the same click was
// worse than the coherence problem it was meant to fix). Renders nothing
// when the entry has no clip yet (see audioUrl).
export function PronounceButton({ entry, className }: { entry: Entry; className?: string }) {
  const url = audioUrl(entry)
  const [playing, setPlaying] = useState(false)

  if (!url) return null

  const play = (ev: React.MouseEvent) => {
    ev.stopPropagation()
    if (playing) return
    setPlaying(true)
    const audio = new Audio(url)
    const stop = () => setPlaying(false)
    audio.addEventListener("ended", stop)
    audio.addEventListener("error", stop)
    audio.play().catch(stop)
  }

  return (
    <button
      type="button"
      title={`Hear "${entry.term}" pronounced`}
      aria-label={`Play pronunciation of ${entry.term}`}
      onClick={play}
      disabled={playing}
      className={`btn btn-ghost btn-md btn-circle ${playing ? "text-primary animate-pulse" : ""} ${className ?? ""}`}
    >
      <Volume2 className="size-5" aria-hidden="true" />
    </button>
  )
}
