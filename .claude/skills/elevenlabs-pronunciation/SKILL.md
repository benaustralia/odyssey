---
name: elevenlabs-pronunciation
description: Ground truth on ElevenLabs' pronunciation-control mechanisms (inline v3 IPA, SSML phoneme tags, Pronunciation Dictionaries, CMU Arpabet vs IPA) and the TTS API's actual request/response schema. Use before touching scripts/tts-pronunciation.ts or debugging mispronounced audio.
---

## Why this exists
Phase 1b (Plan.md) hit real inconsistency feeding real, cited IPA to `eleven_v3` via its
native inline `/ipa/` syntax: 6 of 8 pilot terms failed, almost all on the same phoneme —
schwa (/ə/) dropped, promoted to a full vowel, or a neighboring voiced consonant devoicing.
That's not a data bug (checked codepoints — every schwa is the correct `U+0259`, including in
the two terms that worked). It's the documented limit of v3's inline IPA. Full primary-source
docs are cached in `references/` — fetched directly (curl + BeautifulSoup text extraction, not
AI-summarized search snippets) after two rounds of WebSearch/WebFetch summaries turned out to
be imprecise or contradictory on exactly the details that mattered.

## The three distinct pronunciation-control mechanisms — don't conflate them
1. **v3 native inline IPA** — wrap a transcription in slashes directly in the `text` field
   (`"/əˈkiːənz/"`), no XML, no dictionary object, `eleven_v3` only. What Phase 1b originally
   used. ElevenLabs' own docs concede **80-90% consistency, not 100%, and identical IPA can
   produce different output across generations** — this is not a corner case, it's the
   documented behavior. (`references/v3-prompting.md`, "IPA with Eleven v3" section.)
2. **Inline SSML `<phoneme alphabet="cmu-arpabet" ph="...">word</phoneme>` tags typed directly
   into `text`** — **`eleven_flash_v2` only**, not v3. ElevenLabs explicitly recommends CMU
   Arpabet over IPA here: *"We recommend using CMU Arpabet for consistent and predictable
   results with v2 models. While IPA can be effective, CMU Arpabet generally offers more
   reliable performance."* Only works per-word (no multi-word phrase tags).
   (`references/v3-prompting.md`, "Phoneme tags for v2 models".)
3. **A Pronunciation Dictionary object** (`POST /v1/pronunciation-dictionaries/add-from-rules`,
   phoneme or alias rules, IPA or CMU alphabet) **attached via `pronunciation_dictionary_locators`
   on the TTS request — works on BOTH `eleven_flash_v2` AND `eleven_v3`.** This is the
   mechanism that lets you pair v3's voice quality with Arpabet's better-documented reliability
   — mechanism 2 (inline SSML tags) can't do that since it's flash_v2-only.
   (`references/pronunciation-dictionaries.md`; `references/api-pronunciation-dictionaries-create-from-rules.md`.)

**Tested and failed (2026-08-08).** Routed the 6 schwa-failing pilot terms through mechanism 3
with CMU Arpabet rules on `eleven_v3` — worse, not better: intrusive consonants (an extra /l/
appearing at word onset), collapsed syllables, shifted stress. Root cause: the "CMU Arpabet is
more reliable" claim in the docs is explicitly scoped to **v2 models** in context — we'd
generalized it to v3 without warrant. Follow-up round tried the properly-scoped pairing
(Arpabet dictionary + `eleven_flash_v2`) and, separately, v3 inline IPA with explicit
syllable-break dots at the vowel-hiatus points that kept collapsing (`əˈkiː.ənz` instead of
`əˈkiːənz`) — **both still failed**, still on schwa/vowel accuracy, just differently each time
(schwa promoted to /e/ or /a/ or /aɪ/, `/ʊ/` dropped, final -s voicing still wrong on some).

**Conclusion: none of ElevenLabs' three pronunciation-control mechanisms reliably nails
stress+vowel+voicing simultaneously for these Greek-derived proper names, across 4 rounds and
~40 generations.** This isn't one bad setting away from working — every mechanism has now
individually failed on the same class of word. Phase 1b pivoted away from TTS synthesis
entirely as a result (see `Plan.md`) toward sourcing real CC-licensed human pronunciation
recordings from Wiktionary/Wikimedia Commons instead. Don't re-attempt inline-IPA or
Arpabet-dictionary tuning on this project without a genuinely new idea — the space has been
covered.

## Voice choice / voice cloning — not the missing piece
Checked whether a different stock voice, or a cloned voice, would fix the schwa/stress
failures rather than the model/mechanism. Conclusion: no, and there's a real architectural
reason why not.

- **Different voices**: ElevenLabs' own docs say only that "different voices may interpret IPA
  slightly differently" and to "test with different voices" — that's noise-level variation
  between voices, not a documented fix for a whole class of failure (schwa collapse, intrusive
  consonants, shifted stress). Nothing in the docs claims any specific voice is meaningfully
  more literal about phonetic input than another.
- **Voice cloning (Instant or Professional)**: clones the *timbre/speaker identity* by
  conditioning on reference audio — it doesn't touch the phonetic-conditioning pathway at all.
  A cloned voice runs through the exact same model (`eleven_v3`, `eleven_flash_v2`, etc.) with
  the exact same text/phoneme handling as any stock voice on that model. There's no mechanism
  by which cloning would make the model more literal about an IPA or Arpabet string — it changes
  *who* is speaking, not *how strictly the model honors the phonetic input it's given*.
- **The actual reason ElevenLabs is inconsistent here, architecturally**: ElevenLabs models
  (v3 especially, marketed as "the most expressive AI voice model") are trained end-to-end on
  real speech rather than a classical rule-based phoneme pipeline — they don't parse phonetic
  input as a hard constraint at inference, they treat it as a strong hint blended with a learned
  "natural speech" prior. That's *why* v3 doesn't even parse SSML at all, and why our schwa kept
  getting "corrected" toward what the model's prior expected. This is a deliberate design
  tradeoff (natural prosody over surgical control), not a bug, and it doesn't vary by voice or
  cloning.

## Alternative providers — the properly-architected option
Classical TTS providers built for exactly this "force this exact pronunciation" use case use a
different pipeline: text → phoneme sequence (via G2P or an explicit override) → acoustic model
conditioned *directly and deterministically* on that phoneme sequence → vocoder. The phoneme
sequence is the literal intermediate representation, not a soft hint an expressive model can
override.

- **Google Cloud Text-to-Speech**: supports `<phoneme alphabet="ipa" ph="...">` in SSML, and
  **guarantees perfect reproducibility — identical input always returns identical audio**. No
  "test multiple generations and pick the best" caveat exists for Google Cloud TTS the way it
  does for every ElevenLabs mechanism above. Neural2 voices are their current top-quality tier.
- **Amazon Polly**: same `<phoneme alphabet="ipa" ph="...">` syntax (also supports X-SAMPA),
  documented to work across Standard, Neural, and long-form engines, no reliability caveat in
  the docs. Exact syntax confirmed from AWS's own docs:
  ```xml
  <speak>
    You say, <phoneme alphabet="ipa" ph="pɪˈkɑːn">pecan</phoneme>.
  </speak>
  ```
**Tested and confirmed materially better (2026-08-08).** Piloted Google Cloud TTS
(`en-GB-Neural2-C`, SSML `<phoneme alphabet="ipa">`) on 10 of the project's Greek-derived names,
including terms ElevenLabs had already failed on across 4 rounds — **8/10 clean on the first
try**, a real step-change from ElevenLabs' near-total failure. Cost was negligible (well under
the 1M-character/month free tier for a batch of short proper nouns). The architectural reasoning
held up empirically, not just on paper.

The 2 that didn't pass first time (Clytemnestra: secondary stress overpowering primary;
Panopeus: schwa promoted to /a/, stress on the wrong syllable) are a genuinely different failure
mode from ElevenLabs' — not wrong phonemes, but prosody/stress-weighting on top of correctly-
parsed phonemes. Iterating on syllable-break dots and dropping secondary-stress marks produced
**no audible change** — a follow-up hash-check found several of the "different" retries were
byte-identical, meaning Google's phoneme parser silently normalizes away some dot/secondary-
stress variations rather than treating every character as significant. Don't trust that a changed
IPA string produced a changed output without checking file hashes first. Separately caught a
transcription bug on our side: typed plain ASCII "r" instead of the correct IPA `ɹ` in several
Clytemnestra retries, so those specific attempts weren't testing what they appeared to. Not yet
re-tested with that fixed. Amazon Polly remains untested (no pilot run yet, same architectural
case applies).

## `voice_settings` — real schema, no model branching
`GET /v1/voices/settings/default` and the TTS convert endpoint both document ONE schema for
all models: `stability`, `similarity_boost`, `style`, `use_speaker_boost`, `speed` (all
0-1 except speed and use_speaker_boost). **There is no `style_exaggeration` field** — an
earlier WebSearch-summarized pass invented that name and it briefly shipped in
`scripts/tts-pronunciation.ts`'s v3 branch before being caught and reverted. Don't
model-branch `voice_settings` — same shape for `eleven_multilingual_v2`, `eleven_flash_v2`,
and `eleven_v3`. (`references/api-voice-settings-default.md`.)

## `pronunciation_dictionary_locators`
Top-level param on the standard `/v1/text-to-speech/{voice_id}` convert endpoint (not
Studio/Dubbing-only) — `list of {pronunciation_dictionary_id, version_id}`, up to 3 per
request, applied in order. (`references/api-tts-convert.md`.)

## Reference index
- `v3-prompting.md` — the full "Best practices" prompting guide (pauses, pronunciation,
  emotion, pace, stability, audio tags). The single most load-bearing doc here.
- `pronunciation-dictionaries.md` — API how-to guide, `.pls` file format, confirms
  flash_v2 + v3 both honor dictionary locators.
- `pronunciation-dictionary-agents.md` — same feature from the Agents-platform angle.
- `api-pronunciation-dictionaries-create-from-rules.md`, `api-pronunciation-dictionaries-rules-add.md`
  — exact JSON request/response schema for building a dictionary without hand-authoring `.pls` XML.
- `best-practices.md` — general TTS best practices (text normalization, pacing).
- `text-to-speech-overview.md`, `capabilities-tts.md` — product-level overview (some
  content overlaps; kept both since they're not byte-identical).
- `models.md` — model list.
- `api-tts-convert.md` — the `/v1/text-to-speech/{voice_id}` request/response schema.
- `api-voice-settings-default.md`, `api-voice-settings-update.md` — `voice_settings` schema.
- `quickstart.md` — SDK setup.
- `text-to-dialogue.md` — multi-speaker dialogue (not currently used by this project).

## How to refresh
Docs drift. Re-fetch with `curl -sL -A "Mozilla/5.0" <url>` piped through BeautifulSoup
(`main`/`article`/`body` text extraction) rather than WebFetch/WebSearch for anything you're
about to build against — those tools summarize through a smaller model and have already
produced two materially wrong claims in this project (the flash_v2-vs-v3 phoneme-tag split,
and the invented `style_exaggeration` field).
