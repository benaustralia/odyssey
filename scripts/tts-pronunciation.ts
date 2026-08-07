// Renders two pronunciation clips per glossary entry for the pronounce
// button (Plan.md Phase 1): a natural-speed read of the real term text from
// ElevenLabs, then a slow sibling derived LOCALLY from that same clip via
// ffmpeg's pitch-preserving atempo filter — not a second API call.
//
// This is the second design here, not the first: the original approach fed
// the syllable-hyphenated `pron` respelling (e.g. "uh… KEE… unz") to
// ElevenLabs as its own "slow" request. Confirmed by ear (2026-08-08) that
// this reads badly — the model doesn't know what to do with a jammed
// phonetic pseudo-word, while the same text read as the real term ("uh-KEE-
// unz" -> "Achaeans") comes out perfect. So: one real-word API call, tempo-
// stretched afterward. 0.6x chosen after an A/B against 0.7x that turned out
// to be inaudibly close on a ~1s word (0.19s absolute difference) — went
// with the more pronounced option since it costs nothing extra.
//
// Pre-baked offline like every other asset in this repo (art, atlas tiles):
// this is a static SPA with no server runtime, so a live client-side TTS
// call isn't an option, and baking matches the project's existing pattern.
//
// Usage: tsx scripts/tts-pronunciation.ts [termOrSlug...]
//   No args -> render every entry missing either clip.
//   FORCE=1 -> re-render even if both clips already exist.
import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { entries, type Entry } from "../src/lib/entries"
import { slugify } from "../src/lib/slug"

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const SLOW_ATEMPO = "0.6"

function readEnv(path: string): Record<string, string> {
  const env: Record<string, string> = {}
  if (!existsSync(path)) return env
  for (const line of readFileSync(path, "utf-8").split("\n")) {
    const t = line.trim()
    if (!t || t.startsWith("#")) continue
    const i = t.indexOf("=")
    if (i === -1) continue
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
  return env
}

const env = readEnv(join(ROOT, ".env.elevenlabs.local"))
const apiKey = env.ELEVENLABS_API_KEY
const voiceId = env.ELEVENLABS_VOICE_ID
const modelId = env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2"
const force = process.env.FORCE === "1"

if (!apiKey || !voiceId) {
  console.error("Missing ELEVENLABS_API_KEY / ELEVENLABS_VOICE_ID in .env.elevenlabs.local")
  process.exit(1)
}

const audioDir = join(ROOT, "public", "audio")
mkdirSync(audioDir, { recursive: true })

async function ttsNatural(text: string, outPath: string) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": apiKey!, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: { stability: 0.6, similarity_boost: 0.75, style: 0, use_speaker_boost: true, speed: 1.0 },
    }),
    signal: AbortSignal.timeout(60_000),
  })
  if (!res.ok) throw new Error(`ElevenLabs TTS failed (${res.status}): ${await res.text()}`)
  writeFileSync(outPath, Buffer.from(await res.arrayBuffer()))
}

function deriveSlow(fastPath: string, slowPath: string) {
  execFileSync("ffmpeg", ["-y", "-v", "error", "-i", fastPath, "-filter:a", `atempo=${SLOW_ATEMPO}`, "-ar", "44100", slowPath])
}

async function renderEntry(e: Entry) {
  const slug = slugify(e.term)
  const slowPath = join(audioDir, `${slug}-slow.mp3`)
  const fastPath = join(audioDir, `${slug}-fast.mp3`)
  const needFast = force || !existsSync(fastPath)
  const needSlow = force || needFast || !existsSync(slowPath)
  if (!needFast && !needSlow) return console.log(`Skip ${slug} (both exist; FORCE=1 to re-render)`)

  if (needFast) await ttsNatural(e.term, fastPath)
  if (needSlow) deriveSlow(fastPath, slowPath)
  console.log(`Wrote ${slug}${needFast ? " fast" : ""}${needSlow ? " slow" : ""}`)
}

const wanted = process.argv.slice(2)
const targets = wanted.length
  ? entries.filter((e) => wanted.includes(e.term) || wanted.includes(slugify(e.term)))
  : entries

if (wanted.length && targets.length !== wanted.length) {
  console.warn("No match for:", wanted.filter((w) => !targets.some((e) => e.term === w || slugify(e.term) === w)))
}

console.log(`Rendering ${targets.length} entr${targets.length === 1 ? "y" : "ies"} (voice=${voiceId} model=${modelId}, slow=${SLOW_ATEMPO}x)`)
for (const e of targets) {
  try {
    await renderEntry(e)
  } catch (err) {
    console.error(`FAILED ${e.term}:`, err)
  }
}
console.log("Done.")
