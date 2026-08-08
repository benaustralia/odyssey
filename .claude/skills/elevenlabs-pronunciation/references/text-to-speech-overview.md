# Text to Speech | ElevenLabs Documentation
Source: https://elevenlabs.io/docs/overview/capabilities/text-to-speech

Login
Overview
ElevenCreative
ElevenAgents
ElevenAPI
Reception.ai
API reference
Changelog
Help Center
Introduction
Models
Capabilities
Text to Speech
Best practices
Speech to Text
Music
Text to Dialogue
Image & Video
Ads Engine
Voice Changer
Voice Isolator
Dubbing
Sound Effects
Voices
Voice Remixing
Forced Alignment
Voice Agents
Speech Engine
Administration
Account
Billing
Pay As You Go
Consolidated billing
Data Residency
Usage analytics
Assets
Workspaces
Connect
Blog
Help Center
API Pricing
Sign up
Light
On this page
Overview
Voice quality
Voice options
Supported languages
Prompting
FAQ
Key facts
Scroll to top
Capabilities
Text to Speech
Copy page
Learn how to turn text into lifelike spoken audio with ElevenLabs.
Overview
ElevenLabs
Text to Speech (TTS)
API turns text into lifelike audio with nuanced intonation, pacing and emotional awareness.
Our models
adapt to textual cues across 32 languages and multiple voice styles and can be used to:
Narrate global media campaigns & ads
Produce audiobooks in multiple languages with complex emotional delivery
Stream real-time audio from text
Listen to a sample:
Explore our
voice library
to find the perfect voice for your project.
The voice library is not available via the API to free tier users.
Products
Step-by-step guide for using text to speech in ElevenLabs.
Developers
Learn how to integrate text to speech into your application.
API reference
Full API reference for the Text to Speech endpoint.
MCP
Generate speech from Claude or any MCP client with the hosted MCP server.
Voice quality
For real-time applications, Flash v2.5 provides ultra-low 75ms latency, while Multilingual v2 delivers the highest quality audio with more nuanced expression.
Eleven v3
Our most emotionally rich, expressive speech synthesis model
Dramatic delivery and performance
70+ languages supported
5,000 character limit
Support for natural multi-speaker dialogue
Eleven Multilingual v2
Lifelike, consistent quality speech synthesis model
Natural-sounding output
29 languages supported
10,000 character limit
Most stable on long-form generations
Eleven Flash v2.5
Our fast, affordable speech synthesis model
Ultra-low latency (~75ms†)
32 languages supported
40,000 character limit
Faster model, 50% lower price per character for API generations
Explore all
Voice options
ElevenLabs offers thousands of voices across 32 languages through multiple creation methods:
Voice library
with 3,000+ community-shared voices
Professional voice cloning
for highest-fidelity replicas
Instant voice cloning
for quick voice replication
Voice design
to generate custom voices from text descriptions
Learn more about our
voice options
.
Supported output formats
The default response format is
mp3
, but other formats like
pcm
and
ulaw
are available.
MP3
Sample rates: 22.05kHz - 44.1kHz
Bitrates: 32kbps - 192kbps
22.05kHz @ 32kbps
44.1kHz @ 32kbps, 64kbps, 96kbps, 128kbps, 192kbps
PCM (S16LE)
Sample rates: 16kHz - 44.1kHz
Bitrates: 8kHz, 16kHz, 22.05kHz, 24kHz, 44.1kHz, 48kHz
16-bit depth
μ-law
8kHz sample rate
Optimized for telephony applications
A-law
8kHz sample rate
Optimized for telephony applications
Opus
Sample rate: 48kHz
Bitrates: 32kbps - 192kbps
Higher quality audio options are only available on paid tiers - see our
pricing
page
for details.
Supported languages
Our multilingual v2 models support 29 languages:
English (USA, UK, Australia, Canada), Japanese, Chinese, German, Hindi, French (France, Canada), Korean, Portuguese (Brazil, Portugal), Italian, Spanish (Spain, Mexico), Indonesian, Dutch, Turkish, Filipino, Polish, Swedish, Bulgarian, Romanian, Arabic (Saudi Arabia, UAE), Czech, Greek, Finnish, Croatian, Malay, Slovak, Danish, Tamil, Ukrainian & Russian.
Flash v2.5 supports 32 languages - all languages from v2 models plus:
Hungarian, Norwegian & Vietnamese
Simply input text in any of our supported languages and select a matching voice from our
voice library
. For the most natural results, choose a voice with an accent that matches your target language and region.
Prompting
The models interpret emotional context directly from the text input. For example, adding
descriptive text like “she said excitedly” or using exclamation marks will influence the speech
emotion. Voice settings like Stability and Similarity help control the consistency, while the
underlying emotion comes from textual cues.
Read the
prompting guide
for more details.
Descriptive text will be spoken out by the model and must be manually trimmed or removed from the
audio if desired.
FAQ
Can I clone my own voice?
Yes, you can create
instant voice clones
of your own voice
from short audio clips. For high-fidelity clones, check out our
professional voice
cloning
feature.
Do I own the audio output?
Yes. You retain ownership of any audio you generate. However, commercial usage rights are only
available with paid plans. With a paid subscription, you may use generated audio for commercial
purposes and monetize the outputs if you own the IP rights to the input content.
What qualifies as a free regeneration?
A free regeneration allows you to regenerate the same text to speech content without additional cost, subject to these conditions:
You can regenerate each piece of content up to 2 times for free
The content must be exactly the same as the previous generation. Any changes to the text, voice settings, or other parameters will require a new, paid generation
Free regenerations are useful in case there is a slight distortion in the audio output. According to ElevenLabs’ internal benchmarks, regenerations will solve roughly half of issues with quality, with remaining issues usually due to poor training data.
How do I reduce latency for real-time cases?
Use the low-latency Flash
models
(Flash v2 or v2.5) optimized for near real-time
conversational or interactive scenarios. See our
latency optimization
guide
for more details.
Why is my output sometimes inconsistent?
The models are nondeterministic. For consistency, use the optional
seed
parameter
, though subtle
differences may still occur.
What's the best practice for large text conversions?
Split long text into segments and use streaming for real-time playback and efficient processing.
To maintain natural prosody flow between chunks, include
previous/next text or previous/next
request id parameters
.
Key facts
Determinism
: Output is nondeterministic — use the
seed
parameter for more consistent results
Free regenerations
: Up to 2 free regenerations per generation (same content and parameters only)
Ownership
: You retain ownership of generated audio; commercial use requires a paid plan
Low-latency use cases
: Use Flash models (
eleven_flash_v2
or
eleven_flash_v2_5
) — see the
latency optimization guide
Large text
: Split long text into segments; use the
previous_text
/
next_text
parameters to maintain natural prosody across chunks
