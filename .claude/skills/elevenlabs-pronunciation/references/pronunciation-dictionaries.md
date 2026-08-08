# Using pronunciation dictionaries | ElevenLabs Documentation
Source: https://elevenlabs.io/docs/eleven-api/guides/how-to/text-to-speech/pronunciation-dictionaries

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
Streaming
Request stitching
Pronunciation dictionaries
Streaming and caching with Supabase
Twilio
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
Overview
Quickstart
Next steps
Scroll to top
How-to guides
Text to Speech
Using pronunciation dictionaries
Copy page
This guide shows you how to manage pronunciation dictionaries programmatically.
How-to guide
· Assumes you have completed the
ElevenAPI
quickstart
.
Overview
Pronunciation dictionaries allow you to customize how your AI agent pronounces specific words or phrases. This is particularly useful for:
Correcting pronunciation of names, places, or technical terms
Ensuring consistent pronunciation across conversations
Customizing regional pronunciation variations
ElevenLabs supports both
IPA
and
CMU
alphabets.
Pronunciation dictionary phoneme tags only work with eleven_flash_v2  and eleven_v3 models.
Other models skip dictionary phoneme tags and use the default pronunciation. For other models, use
alias tags instead to substitute spellings or phrases that produce the pronunciation you need.
If you want to use IPA and CMU pronunciations in languages other than English, you will have to
switch to the eleven_v3 model.
Quickstart
This guide assumes you have
set up your API key and SDK
. Complete
the quickstart first if you haven’t.
1
Create a pronunciation dictionary file
In this example, we will create a pronunciation dictionary file for the word
tomato
.
This rule will use the “IPA” alphabet and update the pronunciation for
tomato
and
Tomato
with a different pronunciation. PLS files are case sensitive which is why we include it both with and without a capital “T”.
You can use AI tools like Claude or ChatGPT to help generate IPA or CMU notations for specific words.
dictionary.pls
1
<?
xml
version
=
"
1.0
"
encoding
=
"
UTF-8
"
?>
2
<
lexicon
version
=
"
1.0
"
3
xmlns
=
"
http://www.w3.org/2005/01/pronunciation-lexicon
"
4
xmlns
:
xsi
=
"
http://www.w3.org/2001/XMLSchema-instance
"
5
xsi
:
schemaLocation
=
"
http://www.w3.org/2005/01/pronunciation-lexicon
6
http://www.w3.org/TR/2007/CR-pronunciation-lexicon-20071212/pls.xsd
"
7
alphabet
=
"
ipa
"
xml
:
lang
=
"
en-US
"
>
8
<
lexeme
>
9
<
grapheme
>
tomato
</
grapheme
>
10
<
phoneme
>
/tə'meɪtoʊ/
</
phoneme
>
11
</
lexeme
>
12
<
lexeme
>
13
<
grapheme
>
Tomato
</
grapheme
>
14
<
phoneme
>
/tə'meɪtoʊ/
</
phoneme
>
15
</
lexeme
>
16
</
lexicon
>
2
Create a pronunciation dictionary from a file via the SDK
Create a new file named
example.py
or
example.mts
, depending on your language of choice and add the following code:
Python
TypeScript
1
import
requests
2
from
elevenlabs
.
play
import
play
,
PronunciationDictionaryVersionLocator
3
4
with
open
(
"
dictionary.pls
"
,
"
rb
"
)
as
f
:
5
# this dictionary changes how tomato is pronounced
6
pronunciation_dictionary
=
elevenlabs
.
pronunciation_dictionaries
.
create_from_file
(
7
file
=
f
.
read
(),
name
=
"
example
"
8
)
9
10
audio_1
=
elevenlabs
.
text_to_speech
.
convert
(
11
text
=
"
Without the dictionary: tomato
"
,
12
voice_id
=
"
aMSt68OGf4xUZAnLpTU8
"
,
13
model_id
=
"
eleven_flash_v2
"
,
14
)
15
16
audio_2
=
elevenlabs
.
text_to_speech
.
convert
(
17
text
=
"
With the dictionary: tomato
"
,
18
voice_id
=
"
aMSt68OGf4xUZAnLpTU8
"
,
19
model_id
=
"
eleven_flash_v2
"
,
20
pronunciation_dictionary_locators
=
[
21
PronunciationDictionaryVersionLocator
(
22
pronunciation_dictionary_id
=
pronunciation_dictionary
.
id
,
23
version_id
=
pronunciation_dictionary
.
version_id
,
24
)
25
],
26
)
27
28
# play the audio
29
play
(
audio_1
)
30
play
(
audio_2
)
3
Execute the code
Python
TypeScript
1
python example
.
py
You should hear two versions of the audio playing through your speakers, one with and one without the pronunciation dictionary.
Next steps
API reference
Full pronunciation dictionary API reference.
TTS streaming
Stream text to speech progressively for lower latency playback.
