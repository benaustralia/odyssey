# Models | ElevenLabs Documentation
Source: https://elevenlabs.io/docs/models

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
Flagship models
Text to Speech
Speech to Text
Music
Models overview
Deprecated models
Eleven v3
Supported languages
Multilingual v2
Flash v2.5
Considerations
Model selection guide
Character limits
Scribe v2
Scribe v2 Realtime
Eleven Music
Concurrency and priority
API requests per minute vs concurrent requests
Understanding concurrency limits
Scale testing concurrency limits
Scroll to top
Models
Copy page
Flagship models
Text to Speech
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
Speech to Text
Scribe v2
State-of-the-art speech recognition model
Accurate transcription in 90+ languages
Keyterm prompting, up to 1000 terms
Entity detection, 65 entity types
Precise word-level timestamps
Speaker diarization, up to 32 speakers
Dynamic audio tagging
Smart language detection
Scribe v2 Realtime
Real-time speech recognition model
Accurate transcription in 90+ languages
Real-time transcription
Low latency (~150ms†)
Precise word-level timestamps
Entity detection, 65 entity types
Music
Eleven Music v2
Studio-grade music with natural language prompts in any style
Complete control over genre, style, and structure
Vocals or just instrumental
Multilingual, including English, Spanish, German, Japanese and more
Edit the sound and lyrics of individual sections or the whole song
Pricing
Models overview
The ElevenLabs API offers a range of audio models optimized for different use cases, quality levels, and performance requirements.
Model ID
Description
Languages
eleven_v3
Human-like and expressive speech generation
70+ languages
eleven_ttv_v3
Human-like and expressive voice design model (Text to Voice)
70+ languages
eleven_multilingual_v2
Our most lifelike model with rich emotional expression
en
,
ja
,
zh
,
de
,
hi
,
fr
,
ko
,
pt
,
it
,
es
,
id
,
nl
,
tr
,
fil
,
pl
,
sv
,
bg
,
ro
,
ar
,
cs
,
el
,
fi
,
hr
,
ms
,
sk
,
da
,
ta
,
uk
,
ru
eleven_flash_v2_5
Ultra-fast model optimized for real-time use (~75ms†)
All
eleven_multilingual_v2
languages plus:
hu
,
no
,
vi
eleven_flash_v2
Ultra-fast model optimized for real-time use (~75ms†)
en
eleven_multilingual_sts_v2
State-of-the-art multilingual voice changer model (Speech to Speech)
en
,
ja
,
zh
,
de
,
hi
,
fr
,
ko
,
pt
,
it
,
es
,
id
,
nl
,
tr
,
fil
,
pl
,
sv
,
bg
,
ro
,
ar
,
cs
,
el
,
fi
,
hr
,
ms
,
sk
,
da
,
ta
,
uk
,
ru
eleven_multilingual_ttv_v2
State-of-the-art multilingual voice designer model (Text to Voice)
en
,
ja
,
zh
,
de
,
hi
,
fr
,
ko
,
pt
,
it
,
es
,
id
,
nl
,
tr
,
fil
,
pl
,
sv
,
bg
,
ro
,
ar
,
cs
,
el
,
fi
,
hr
,
ms
,
sk
,
da
,
ta
,
uk
,
ru
eleven_english_sts_v2
English-only voice changer model (Speech to Speech)
en
scribe_v2_realtime
Real-time speech recognition model
90+ languages
scribe_v2
State-of-the-art speech recognition model
90+ languages
eleven_text_to_sound_v2
Sound effects generation from text prompts
N/A
music_v2
Studio-grade music generation from text prompts, composition plans and previously generated songs
en
,
es
,
de
,
ja
, and more
music_v1
Studio-grade music generation from text prompts. Outclassed by
music_v2
en
,
es
,
de
,
ja
, and more
† Excluding application & network latency
Deprecated models
The
eleven_turbo_v2_5
and
eleven_turbo_v2
models are functionally equivalent to the
eleven_flash_v2_5
and
eleven_flash_v2
models respectively, except the latency on the Flash
models is lower on average. We recommend using the Flash models over Turbo models in all use
cases.
Model ID
Description
Languages
Replacement model suggestion
eleven_turbo_v2_5
First generation low-latency model (outclassed by Flash models)
en
,
ja
,
zh
,
de
,
hi
,
fr
,
ko
,
pt
,
it
,
es
,
id
,
nl
,
tr
,
fil
,
pl
,
sv
,
bg
,
ro
,
ar
,
cs
,
el
,
fi
,
hr
,
ms
,
sk
,
da
,
ta
,
uk
,
ru
,
hu
,
no
,
vi
eleven_flash_v2_5
eleven_turbo_v2
First generation low-latency model (outclassed by Flash models)
en
eleven_flash_v2
scribe_v1
First generation speech recognition (outclassed by v2 models)
90+ languages
scribe_v2
Eleven v3
Eleven v3 is our latest and most advanced speech synthesis model. It is a state-of-the-art model that produces natural, life-like speech with high emotional range and contextual understanding across multiple languages.
This model works well in the following scenarios:
Character Discussions
: Excellent for audio experiences with multiple characters that interact with each other.
Audiobook Production
: Perfect for long-form narration with complex emotional delivery.
Emotional Dialogue
: Generate natural, lifelike dialogue with high emotional range and contextual understanding.
With Eleven v3 comes a new Text to Dialogue API, which allows you to generate natural, lifelike dialogue with high emotional range and contextual understanding across multiple languages. Eleven v3 can also be used with the Text to Speech API to generate natural, lifelike speech with high emotional range and contextual understanding across multiple languages.
Read more about the Text to Dialogue API
here
.
Supported languages
The Eleven v3 model supports 70+ languages, including:
Afrikaans (afr), Arabic (ara), Armenian (hye), Assamese (asm), Azerbaijani (aze), Belarusian (bel), Bengali (ben), Bosnian (bos), Bulgarian (bul), Catalan (cat), Cebuano (ceb), Chichewa (nya), Croatian (hrv), Czech (ces), Danish (dan), Dutch (nld), English (eng), Estonian (est), Filipino (fil), Finnish (fin), French (fra), Galician (glg), Georgian (kat), German (deu), Greek (ell), Gujarati (guj), Hausa (hau), Hebrew (heb), Hindi (hin), Hungarian (hun), Icelandic (isl), Indonesian (ind), Irish (gle), Italian (ita), Japanese (jpn), Javanese (jav), Kannada (kan), Kazakh (kaz), Kirghiz (kir), Korean (kor), Latvian (lav), Lingala (lin), Lithuanian (lit), Luxembourgish (ltz), Macedonian (mkd), Malay (msa), Malayalam (mal), Mandarin Chinese (cmn), Marathi (mar), Nepali (nep), Norwegian (nor), Pashto (pus), Persian (fas), Polish (pol), Portuguese (por), Punjabi (pan), Romanian (ron), Russian (rus), Serbian (srp), Sindhi (snd), Slovak (slk), Slovenian (slv), Somali (som), Spanish (spa), Swahili (swa), Swedish (swe), Tamil (tam), Telugu (tel), Thai (tha), Turkish (tur), Ukrainian (ukr), Urdu (urd), Vietnamese (vie), Welsh (cym).
Multilingual v2
Eleven Multilingual v2 is our most advanced, emotionally-aware speech synthesis model. It produces natural, lifelike speech with high emotional range and contextual understanding across multiple languages.
The model delivers consistent voice quality and personality across all supported languages while maintaining the speaker’s unique characteristics and accent.
This model excels in scenarios requiring high-quality, emotionally nuanced speech:
Character Voiceovers
: Ideal for gaming and animation due to its emotional range.
Professional Content
: Well-suited for corporate videos and e-learning materials.
Multilingual Projects
: Maintains consistent voice quality across language switches.
Stable Quality
: Produces consistent, high-quality audio output.
While it has a higher latency & cost per character than Flash models, it delivers superior quality for projects where lifelike speech is important.
Our multilingual v2 models support 29 languages:
English (USA, UK, Australia, Canada), Japanese, Chinese, German, Hindi, French (France, Canada), Korean, Portuguese (Brazil, Portugal), Italian, Spanish (Spain, Mexico), Indonesian, Dutch, Turkish, Filipino, Polish, Swedish, Bulgarian, Romanian, Arabic (Saudi Arabia, UAE), Czech, Greek, Finnish, Croatian, Malay, Slovak, Danish, Tamil, Ukrainian & Russian.
Flash v2.5
Eleven Flash v2.5 is our fastest speech synthesis model, designed for real-time applications and Agents Platform. It delivers high-quality speech with ultra-low latency (~75ms†) across 32 languages.
The model balances speed and quality, making it ideal for interactive applications while maintaining natural-sounding output and consistent voice characteristics across languages.
This model is particularly well-suited for:
Agents Platform
: Perfect for real-time voice agents and chatbots.
Interactive Applications
: Ideal for games and applications requiring immediate response.
Large-Scale Processing
: Efficient for bulk text-to-speech conversion.
With its lower price point for API generations and 75ms latency, Flash v2.5 is the cost-effective option for anyone needing fast, reliable speech synthesis across multiple languages.
Flash v2.5 supports 32 languages - all languages from v2 models plus:
Hungarian, Norwegian & Vietnamese
† Excluding application & network latency
Considerations
Text normalization with numbers
When using Flash v2.5, numbers aren’t normalized by default in a way you might expect. For example, phone numbers might be read out in way that isn’t clear for the user. Dates and currencies are affected in a similar manner.
By default, normalization is disabled for Flash v2.5 to maintain the low latency. However, Enterprise customers can now enable text normalization for v2.5 models by setting the
apply_text_normalization
parameter to “on” in your request.
The Multilingual v2 model does a better job of normalizing numbers, so we recommend using it for phone numbers and other cases where number normalization is important.
For low-latency or Agents Platform applications, best practice is to have your LLM
normalize the text
before passing it to the TTS model, or use the
apply_text_normalization
parameter (Enterprise plans only for v2.5 models).
Model selection guide
For guidance on which model best fits your requirements and use case, see the
model selection guide
.
Requirements
Quality
Use
eleven_multilingual_v2
Best for high-fidelity audio output with rich emotional expression
Low-latency
Use Flash models
Optimized for real-time applications (~75ms latency)
Multilingual
Use either either
eleven_multilingual_v2
or
eleven_flash_v2_5
Both support up to 32 languages
Balanced
Use
eleven_flash_v2_5
Good balance between quality and speed
Use case
Content creation
Use
eleven_multilingual_v2
Ideal for professional content, audiobooks & video narration.
Agents Platform
Use
eleven_flash_v2_5
,
eleven_flash_v2
or
eleven_multilingual_v2
Perfect for real-time conversational applications
Voice changer
Use
eleven_multilingual_sts_v2
Specialized for Speech-to-Speech conversion
Character limits
The maximum number of characters supported in a single text-to-speech request varies by model.
Model ID
Character limit
Approximate audio duration
eleven_v3
5,000
~5 minutes
eleven_flash_v2_5
40,000
~40 minutes
eleven_flash_v2
30,000
~30 minutes
eleven_multilingual_v2
10,000
~10 minutes
eleven_multilingual_v1
10,000
~10 minutes
eleven_english_sts_v2
10,000
~10 minutes
eleven_english_sts_v1
10,000
~10 minutes
For longer content, consider splitting the input into multiple requests.
Scribe v2
Scribe v2 is our state-of-the-art speech recognition model designed for accurate transcription across 90+ languages. It provides precise word-level timestamps and advanced features like speaker diarization and dynamic audio tagging.
This model excels in scenarios requiring accurate speech-to-text conversion:
Transcription Services
: Perfect for converting audio/video content to text
Meeting Documentation
: Ideal for capturing and documenting conversations
Content Analysis
: Well-suited for audio content processing and analysis
Multilingual Recognition
: Supports accurate transcription across 90+ languages
Key features:
Accurate transcription with word-level timestamps
Speaker diarization for multi-speaker audio
Dynamic audio tagging for enhanced context
Support for 90+ languages
Entity detection
Keyterm prompting
Read more about Scribe v2
here
.
Scribe v2 Realtime
Scribe v2 Realtime, our fastest and most accurate live speech recognition model, delivers state-of-the-art accuracy in over 90 languages with an ultra-low 150ms of latency.
This model excels in conversational use cases:
Live meeting transcription
: Perfect for realtime transcription
AI Agents
: Ideal for live conversations
Multilingual Recognition
: Supports accurate transcription across 90+ languages with automatic language recognition
Key features:
Ultra-low latency: Get partial transcriptions in ~150 milliseconds
Streaming support: Send audio in chunks while receiving transcripts in real-time
Multiple audio formats: Support for PCM (8kHz to 48kHz) and μ-law encoding
Voice Activity Detection (VAD): Automatic speech segmentation based on silence detection
Manual commit control: Full control over when to finalize transcript segments
Entity detection
Read more about Scribe v2 Realtime
here
.
Eleven Music
Eleven Music is our studio-grade music generation model. It allows you to generate music with natural language prompts in any style.
This model is excellent for the following scenarios:
Game Soundtracks
: Create immersive soundtracks for games
Podcast Backgrounds
: Enhance podcasts with professional music
Marketing
: Add background music to ad reels
Key features:
Complete control over genre, style, and structure
Vocals or just instrumental
Multilingual, including English, Spanish, German, Japanese and more
Edit the sound and lyrics of individual sections or the whole song
Read more about Eleven Music
here
.
Concurrency and priority
Your subscription plan determines how many requests can be processed simultaneously and the priority level of your requests in the queue.
Speech to Text has an elevated concurrency limit.
Once the concurrency limit is met, subsequent requests are processed in a queue alongside lower-priority requests.
In practice this typically only adds ~50ms of latency.
Plan
Concurrency Limit
(Multilingual v2)
Concurrency Limit
(Flash)
STT Concurrency Limit
Realtime STT Concurrency limit
Music Concurrency limit
Priority level
Free
2
4
8
6
0
3
Starter
3
6
12
9
2
4
Creator
5
10
20
15
2
5
Pro
10
20
40
30
2
5
Scale
15
30
60
45
5
5
Business
15
30
60
45
5
5
Enterprise
Elevated
Elevated
Elevated
Elevated
Highest
6
Startup grants recipients receive Scale level benefits.
The response headers include
current-concurrent-requests
and
maximum-concurrent-requests
which you can use to monitor your concurrency.
API requests per minute vs concurrent requests
It’s important to understand that
API requests per minute
and
concurrent requests
are different metrics that depend on your usage patterns.
API requests per minute can be different from concurrent requests since it depends on the length of time for each request and how the requests are batched.
Example 1: Spaced requests
If you had 180 requests per minute that each took 1 second to complete and you sent them each 0.33 seconds apart, the max concurrent requests would be 3 and the average would be 3 since there would always be 3 in flight.
Example 2: Batched requests
However, if you had a different usage pattern such as 180 requests per minute that each took 3 seconds to complete but all fired at once, the max concurrent requests would be 180 and the average would be 9 (first 3 seconds of the minute saw 180 requests at once, final 57 seconds saw 0 requests).
Since our system cares about concurrency, requests per minute matter less than how long each of the requests take and the pattern of when they are sent.
How endpoint requests are made impacts concurrency limits:
With HTTP, each request counts individually toward your concurrency limit.
With a WebSocket, only the time where our model is generating audio counts towards your concurrency limit, this means a for most of the time an open websocket doesn’t count towards your concurrency limit at all.
Understanding concurrency limits
The concurrency limit associated with your plan should not be interpreted as the maximum number of simultaneous conversations, phone calls character voiceovers, etc that can be handled at once.
The actual number depends on several factors, including the specific AI voices used and the characteristics of the use case.
As a general rule of thumb, a concurrency limit of 5 can typically support up to approximately 100 simultaneous audio broadcasts.
This is because of the speed it takes for audio to be generated relative to the time it takes for the TTS request to be processed.
The diagram below is an example of how 4 concurrent calls with different users can be facilitated while only hitting 2 concurrent requests.
Building AI Voice Agents
Where TTS is used to facilitate dialogue, a concurrency limit of 5 can support about 100 broadcasts for balanced conversations between AI agents and human participants.
For use cases in which the AI agent speaks less frequently than the human, such as customer support interactions, more than 100 simultaneous conversations could be supported.
Character voiceovers
Generally, more than 100 simultaneous character voiceovers can be supported for a concurrency limit of 5.
The number can vary depending on the character’s dialogue frequency, the length of pauses, and in-game actions between lines.
Live Dubbing
Concurrent dubbing streams generally follow the provided heuristic.
If the broadcast involves periods of conversational pauses (e.g. because of a soundtrack, visual scenes, etc), more simultaneous dubbing streams than the suggestion may be possible.
If you exceed your plan’s concurrency limits at any point and you are on the Enterprise plan, model requests may still succeed, albeit slower, on a best efforts basis depending on available capacity.
To increase your concurrency limit & queue priority,
upgrade your subscription
plan
.
Enterprise customers can request a higher concurrency limit by contacting their account manager.
Scale testing concurrency limits
Scale testing can be useful to identify client side scaling issues and to verify concurrency limits are set correctly for your usecase.
It is heavily recommended to test end-to-end workflows as close to real world usage as possible, simulating and measuring how many users can be supported is the recommended methodology for achieving this. It is important to:
Simulate users, not raw requests
Simulate typical user behavior such as waiting for audio playback, user speaking or transcription to finish before making requests
Ramp up the number of users slowly over a period of minutes
Introduce randomness to request timings and to the size of requests
Capture latency metrics and any returned error codes from the API
For example, to test an agent system designed to support 100 simultaneous conversations you would create up to 100 individual “users” each simulating a conversation. Conversations typically consist of a repeating cycle of ~10 seconds of user talking, followed by the TTS API call for ~150 characters, followed by ~10 seconds of audio playback to the user. Therefore, each user should follow the pattern of making a websocket Text-to-Speech API call for 150 characters of text every 20 seconds, with a small amount of randomness introduced to the wait period and the number of characters requested. The test would consist of spawning one user per second until 100 exist and then testing for 10 minutes in total to test overall stability.
Scale testing script example
This example uses
locust
as the testing framework with direct API calls to the ElevenLabs API.
It follows the example listed above, testing a conversational agent system with each user sending 1 request every 20 seconds.
Python
1
import
json
2
import
random
3
import
time
4
import
gevent
5
import
locust
6
from
locust
import
User
,
task
,
events
,
constant_throughput
7
import
websocket
8
9
# Averages up to 10 seconds of audio when played, depends on the voice speed
10
DEFAULT_TEXT
=
(
11
"
Hello, this is a test message. I am testing if a long input will cause issues for the model
"
12
"
like this sentence.
"
13
)
14
15
TEXT_ARRAY
=
[
16
"
Hello.
"
,
17
"
Hello, this is a test message.
"
,
18
DEFAULT_TEXT
,
19
DEFAULT_TEXT
*
2
,
20
DEFAULT_TEXT
*
3
21
]
22
23
# Custom command line arguments
24
@
events
.
init_command_line_parser
.
add_listener
25
def
on_parser_init
(
parser
):
26
parser
.
add_argument
(
"
--api-key
"
,
default
=
"
YOUR_API_KEY
"
,
help
=
"
API key for authentication
"
)
27
parser
.
add_argument
(
"
--encoding
"
,
default
=
"
mp3_22050_32
"
,
help
=
"
Encoding
"
)
28
parser
.
add_argument
(
"
--text
"
,
default
=
DEFAULT_TEXT
,
help
=
"
Text to use
"
)
29
parser
.
add_argument
(
"
--use-text-array
"
,
default
=
"
false
"
,
help
=
"
Text to use
"
)
30
parser
.
add_argument
(
"
--voice-id
"
,
default
=
"
aria
"
,
help
=
"
Text to use
"
)
31
32
33
class
WebSocketTTSUser
(
User
):
34
# Each user will send a request every 20 seconds, regardless of how long each request takes
35
wait_time
=
constant_throughput
(
0.05
)
36
37
def
__init__
(
self
,
*
args
,
**
kwargs
):
38
super
().
__init__
(
*
args
,
**
kwargs
)
39
self
.
api_key
=
self
.
environment
.
parsed_options
.
api_key
40
self
.
voice_id
=
self
.
environment
.
parsed_options
.
voice_id
41
self
.
text
=
self
.
environment
.
parsed_options
.
text
42
self
.
encoding
=
self
.
environment
.
parsed_options
.
encoding
43
self
.
use_text_array
=
self
.
environment
.
parsed_options
.
use_text_array
44
if
self
.
use_text_array
:
45
self
.
text
=
random
.
choice
(
TEXT_ARRAY
)
46
self
.
all_recieved
=
False
47
48
@
task
49
def
tts_task
(
self
):
50
# Do jitter waiting of up to 1 second
51
# Users appear to be spawned every second so this ensures requests are not aligned
52
gevent
.
sleep
(
random
.
random
())
53
54
max_wait_time
=
10
55
56
# Connection details
57
uri
=
f
"
{
self
.
environment
.
host
}
/v1/text-to-speech/
{
self
.
voice_id
}
/stream-input?auto_mode=true&output_format=
{
self
.
encoding
}
"
58
headers
=
{
"
xi-api-key
"
:
self
.
api_key
}
59
60
ws
=
None
61
self
.
all_recieved
=
False
62
try
:
63
init_msg
=
{
"
text
"
:
"
"
}
64
# Use proper header format for websocket - this is case sensitive!
65
ws
=
websocket
.
create_connection
(
uri
,
header
=
headers
)
66
ws
.
send
(
json
.
dumps
(
init_msg
))
67
68
# Start measuring after websocket initiated but before any messages are sent
69
send_request_time
=
time
.
perf_counter
()
70
ws
.
send
(
json
.
dumps
({
"
text
"
:
self
.
text
}))
71
72
# Send to flush and receive the audio
73
ws
.
send
(
json
.
dumps
({
"
text
"
:
""
}))
74
75
def
_receive
():
76
t_first_response
=
None
77
audio_size
=
0
78
try
:
79
while
True
:
80
# Wait up to 10 seconds for a response
81
ws
.
settimeout
(
max_wait_time
)
82
response
=
ws
.
recv
()
83
response_data
=
json
.
loads
(
response
)
84
85
if
"
audio
"
in
response_data
and
response_data
[
"
audio
"
]:
86
audio_size
=
audio_size
+
len
(
response_data
[
"
audio
"
])
87
88
if
t_first_response
is
None
:
89
t_first_response
=
time
.
perf_counter
()
90
first_byte_ms
=
(
91
t_first_response
-
send_request_time
92
)
*
1000
93
if
audio_size
is
None
:
94
# The first response should always have audio
95
locust
.
events
.
request
.
fire
(
96
request_type
=
"
websocket
"
,
97
name
=
"
Bad Response (no audio)
"
,
98
response_time
=
first_byte_ms
,
99
response_length
=
audio_size
,
100
exception
=
Exception
(
"
Response has no audio
"
),
101
)
102
break
103
104
if
"
isFinal
"
in
response_data
and
response_data
[
"
isFinal
"
]:
105
# Fire this event once finished streaming, but report the important TTFB metric
106
locust
.
events
.
request
.
fire
(
107
request_type
=
"
websocket
"
,
108
name
=
"
TTS Stream Success (First Byte)
"
,
109
response_time
=
first_byte_ms
,
110
response_length
=
audio_size
,
111
exception
=
None
,
112
)
113
break
114
115
except
websocket
.
WebSocketTimeoutException
:
116
locust
.
events
.
request
.
fire
(
117
request_type
=
"
websocket
"
,
118
name
=
"
TTS Stream Timeout
"
,
119
response_time
=
max_wait_time
*
1000
,
120
response_length
=
audio_size
,
121
exception
=
Exception
(
"
Timeout waiting for response
"
),
122
)
123
except
Exception
as
e
:
124
# Typically JSON decode error if the server returns HTTP backoff error
125
locust
.
events
.
request
.
fire
(
126
request_type
=
"
websocket
"
,
127
name
=
"
TTS Stream Failure
"
,
128
response_time
=
0
,
129
response_length
=
0
,
130
exception
=
e
,
131
)
132
finally
:
133
self
.
all_recieved
=
True
134
135
gevent
.
spawn
(
_receive
)
136
137
# Sleep until recieved so new tasks aren't spawned
138
while
not
self
.
all_recieved
:
139
gevent
.
sleep
(
1
)
140
141
except
websocket
.
WebSocketTimeoutException
:
142
locust
.
events
.
request
.
fire
(
143
request_type
=
"
websocket
"
,
144
name
=
"
TTS Stream Timeout
"
,
145
response_time
=
max_wait_time
*
1000
,
146
response_length
=
0
,
147
exception
=
Exception
(
"
Timeout waiting for response
"
),
148
)
149
except
Exception
as
e
:
150
locust
.
events
.
request
.
fire
(
151
request_type
=
"
websocket
"
,
152
name
=
"
TTS Stream Failure
"
,
153
response_time
=
0
,
154
response_length
=
0
,
155
exception
=
e
,
156
)
157
finally
:
158
# Try and close the websocket gracefully
159
try
:
160
if
ws
:
161
ws
.
close
()
162
except
Exception
:
163
pass
