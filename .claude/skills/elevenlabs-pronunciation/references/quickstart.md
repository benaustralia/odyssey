# ElevenAPI quickstart | ElevenLabs Documentation
Source: https://elevenlabs.io/docs/quickstart

Login
Overview
ElevenCreative
ElevenAgents
ElevenAPI
Reception.ai
API reference
Changelog
Help Center
Get started
Quickstart
Agents Quickstart
Choosing the right model
Tutorials
Text to Speech
Speech to Text
Speech Engine
Music
Text to Dialogue
Voice Changer
Voice Isolator
Dubbing
Sound effects
Forced Alignment
Concepts
Understanding audio streaming
Understanding latency
Voice cloning
How-to guides
Text to Speech
Speech to Text
Music
Dubbing
Voices
WebSockets
Speech Engine
Best Practices
Reference
Libraries & SDKs
Errors
Agent tooling
Webhooks
IP allowlisting
Zero Retention Mode
Breaking changes policy
UI components
Example projects
Next.js template
Showcase
Private deployment
Overview
Connect
Blog
Help Center
API Pricing
Sign up
Light
On this page
Using the Text to Speech API
Next steps
Scroll to top
Get started
ElevenAPI quickstart
Copy page
Learn how to make your first ElevenLabs API request.
By the end of this guide you will have a working script that sends a text string to the ElevenLabs API and plays the returned audio through your speakers. You will learn how to authenticate with an API key, install the SDK, and make your first text-to-speech request.
For guides covering other capabilities — streaming, voice cloning, speech-to-text — see the
Tutorials
section.
Use the
ElevenLabs text-to-speech skill
to generate speech from your AI coding assistant:
$
npx
skills
add
elevenlabs/skills
--skill
text-to-speech
Using the Text to Speech API
1
Create an API key
Create an API key in the dashboard here
, which you’ll use to securely
access the API
.
Store the key as a managed secret and pass it to the SDKs either as a environment variable via an
.env
file, or directly in your app’s configuration depending on your preference.
.env
1
ELEVENLABS_API_KEY
=
<
your_api_key_here
>
2
Install the SDK
We’ll also use the
dotenv
library to load our API key from an environment variable.
Python
TypeScript
1
pip install elevenlabs
2
pip install python
-
dotenv
To play the audio through your speakers, you may be prompted to install
MPV
and/or
ffmpeg
.
3
Make your first request
Create a new file named
example.py
or
example.mts
, depending on your language of choice and add the following code:
Python
TypeScript
1
from
dotenv
import
load_dotenv
2
from
elevenlabs
.
client
import
ElevenLabs
3
from
elevenlabs
.
play
import
play
4
import
os
5
6
load_dotenv
()
7
8
elevenlabs
=
ElevenLabs
(
9
api_key
=
os
.
getenv
(
"
ELEVENLABS_API_KEY
"
),
10
)
11
12
audio
=
elevenlabs
.
text_to_speech
.
convert
(
13
text
=
"
The first move is what sets everything in motion.
"
,
14
voice_id
=
"
JBFqnCBsd6RMkjVDRZzb
"
,
# "George" - browse voices at elevenlabs.io/app/voice-library
15
model_id
=
"
eleven_v3
"
,
16
output_format
=
"
mp3_44100_128
"
,
17
)
18
19
play
(
audio
)
4
Run the code
Python
TypeScript
1
python example
.
py
You should hear the audio play through your speakers.
Next steps
Stream audio
Reduce latency by streaming audio as it generates rather than waiting for the complete file
Browse voices
Explore 10,000+ voices and swap the example voice ID for one that fits your use case
Clone a voice
Create a custom voice from a short audio recording
