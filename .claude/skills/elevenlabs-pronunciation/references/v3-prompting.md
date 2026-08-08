# Best practices | ElevenLabs Documentation
Source: https://elevenlabs.io/docs/best-practices/prompting/eleven-v3

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
Controls
Pauses
Pronunciation
IPA with Eleven v3
Phoneme tags for v2 models
Alias Tags
Pronunciation Dictionaries
Pronunciation Dictionary examples
Emotion
Pace
Tips
Creative control
Text normalization
Why do models read out inputs differently?
Common examples
Mitigation
Use trained models
Apply normalization in LLM prompts
Putting it all together
Use Regular Expressions for preprocessing
Prompting Eleven v3
Voice selection
Settings
Stability
Audio tags
Voice-related
Sound effects
Unique and special
Punctuation
Single speaker examples
Multi-speaker dialogue
Enhancing input
Tips
Scroll to top
Capabilities
Text to Speech
Best practices
Copy page
Learn how to control delivery, pronunciation, emotion, and optimize text for speech.
This guide provides techniques to enhance text-to-speech outputs using ElevenLabs models. Experiment with these methods to discover what works best for your needs.
Controls
We are actively working on
Director’s Mode
to give you even greater control over outputs.
These techniques provide a practical way to achieve nuanced results until advanced features like
Director’s Mode
are rolled out.
Pauses
Eleven v3 does not support SSML break tags. Use the techniques described in the
Prompting Eleven
v3
section for controlling pauses with v3.
Use
<break time="x.xs" />
for natural pauses up to 3 seconds.
Using too many break tags in a single generation can cause instability. The AI might speed up, or
introduce additional noises or audio artifacts. We are working on resolving this.
Example
"Hold on, let me think." <break time="1.5s" /> "Alright, I've got it."
Consistency:
Use
<break>
tags consistently to maintain natural speech flow. Excessive use can lead to instability.
Voice-Specific Behavior:
Different voices may handle pauses differently, especially those trained with filler sounds like “uh” or “ah.”
Alternatives to
<break>
include dashes (- or —) for short pauses or ellipses (…) for hesitant tones. However, these are less consistent.
Example
"It… well, it might work." "Wait — what's that noise?"
Pronunciation
IPA with Eleven v3
The
Eleven v3
model (
eleven_v3
) includes native support for International Phonetic Alphabet (IPA) transcription across 70+ languages, allowing precise control over word and phrase pronunciation without XML tags.
Unlike older models that require XML-style phoneme tags, v3 natively understands IPA symbols when wrapped in forward slashes directly in your text:
Syntax
"/IPA_transcription/"
The IPA transcription should be:
Enclosed in forward slashes (
/
) at the beginning and end
Written using standard IPA symbols
Wrapped in double quotes when passed as a string parameter
Code examples
Python
TypeScript
cURL
1
from
elevenlabs
import
ElevenLabs
2
3
client
=
ElevenLabs
()
4
audio
=
client
.
text_to_speech
.
convert
(
5
voice_id
=
"
21m00Tcm4TlvDq8ikWAM
"
,
6
text
=
'
The term "/ˌbaɪoʊˈkemɪstri/" refers to the study of chemical processes.
'
,
7
model_id
=
"
eleven_v3
"
,
8
)
You can include multiple IPA transcriptions in a single text string:
Python
TypeScript
1
from
elevenlabs
import
ElevenLabs
2
3
client
=
ElevenLabs
()
4
text
=
'
The medication "/ɡluːˈkoʊs/" and "/ˌɪnsjəˈlɪn/" are commonly used to manage conditions like "/ˌdaɪəˈbiːtiːz/".
'
5
audio
=
client
.
text_to_speech
.
convert
(
6
voice_id
=
"
21m00Tcm4TlvDq8ikWAM
"
,
7
text
=
text
,
8
model_id
=
"
eleven_v3
"
,
9
)
Performance
V3’s IPA support achieves 80-90% pronunciation consistency. While significantly more reliable than v2’s XML phoneme tags, it is not 100% consistent. The model may occasionally struggle with certain words or produce different outputs even with identical IPA transcriptions. We are continuing to improve IPA reliability.
Best practices
Use standard IPA symbols from the
International Phonetic Alphabet chart
Include stress markers: primary stress (ˈ) and secondary stress (ˌ) for multi-syllable words
Apply selectively: only wrap specific words or phrases that need pronunciation control
Test with your voice: different voices may interpret IPA slightly differently
Troubleshooting
Pronunciation is still incorrect
Verify your IPA transcription is accurate using an IPA dictionary. Include stress markers (ˈ for
primary stress, ˌ for secondary stress) for multi-syllable words. Test with different voices as
some may interpret IPA more accurately than others.
Inconsistent results with the same IPA
V3’s IPA support is generally reliable but not perfect. The model may occasionally produce
different outputs even with identical IPA transcriptions. If consistency is critical, test
multiple generations and select the best result.
Phoneme tags for v2 models
Specify pronunciation using
SSML phoneme tags
with v2 models. Supported alphabets include
CMU
Arpabet and the
International Phonetic Alphabet (IPA)
.
Phoneme tags are only compatible with the
eleven_flash_v2
model
.
CMU Arpabet Example
IPA Example
1
<
phoneme
alphabet
=
"
cmu-arpabet
"
ph
=
"
M AE1 D IH0 S AH0 N
"
>
2
Madison
3
</
phoneme
>
We recommend using CMU Arpabet for consistent and predictable results with v2 models. While IPA can be effective, CMU Arpabet generally offers more reliable performance.
Phoneme tags only work for individual words. If you have a name with a first and last name that you want to be pronounced a certain way, you will need to create a phoneme tag for each word.
Ensure correct stress marking for multi-syllable words to maintain accurate pronunciation:
Correct usage
Incorrect usage
1
<
phoneme
alphabet
=
"
cmu-arpabet
"
ph
=
"
P R AH0 N AH0 N S IY EY1 SH AH0 N
"
>
2
pronunciation
3
</
phoneme
>
Alias Tags
For models that don’t support phoneme tags, you can try writing words more phonetically. You can also employ various tricks such as capital letters, dashes, apostrophes, or even single quotation marks around a single letter or letters.
As an example, a word like “trapezii” could be spelt “trapezIi” to put more emphasis on the “ii” of the word.
You can either replace the word directly in your text, or if you want to specify pronunciation using other words or phrases when using a pronunciation dictionary, you can use alias tags for this. This can be useful if you’re generating using Multilingual v2, which doesn’t support phoneme tags. You can use pronunciation dictionaries with ElevenCreative Studio, Dubbing Studio and Speech Synthesis via the API.
For example, if your text includes a name that has an unusual pronunciation that the AI might struggle with, you could use an alias tag to specify how you would like it to be pronounced:
<lexeme>
<grapheme>Claughton</grapheme>
<alias>Cloffton</alias>
</lexeme>
If you want to make sure that an acronym is always delivered in a certain way whenever it is encountered in your text, you can use an alias tag to specify this:
<lexeme>
<grapheme>UN</grapheme>
<alias>United Nations</alias>
</lexeme>
Pronunciation Dictionaries
Some of our tools, such as ElevenCreative Studio and Dubbing Studio, allow you to create and upload a pronunciation dictionary. These allow you to specify the pronunciation of certain words, such as character or brand names, or to specify how acronyms should be read.
Pronunciation dictionaries allow this functionality by enabling you to upload a lexicon or dictionary file that specifies pairs of words and how they should be pronounced, either using a phonetic alphabet or word substitutions.
Whenever one of these words is encountered in a project, the AI model will pronounce the word using the specified replacement.
To provide a pronunciation dictionary file, open the settings for a project and upload a file in either TXT or the
.PLS format
. When a dictionary is added to a project it will automatically recalculate which pieces of the project will need to be re-converted using the new dictionary file and mark these as unconverted.
Currently we only support pronunciation dictionaries that specify replacements using phoneme or alias tags.
Both phonemes and aliases are sets of rules that specify a word or phrase they are looking for, referred to as a grapheme, and what it will be replaced with. Please note that searches are case sensitive. When checking for a replacement word in a pronunciation dictionary, the dictionary is checked from start to end and only the very first replacement is used.
Pronunciation Dictionary examples
Here are examples of pronunciation dictionaries in both CMU Arpabet and IPA, including a phoneme to specify the pronunciation of “Apple” and an alias to replace “UN” with “United Nations”:
CMU Arpabet Example
IPA Example
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
cmu-arpabet
"
xml
:
lang
=
"
en-GB
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
apple
</
grapheme
>
10
<
phoneme
>
AE P AH L
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
UN
</
grapheme
>
14
<
alias
>
United Nations
</
alias
>
15
</
lexeme
>
16
</
lexicon
>
To generate a pronunciation dictionary
.pls
file, there are a few open source tools available:
Sequitur G2P
- Open-source tool that learns pronunciation rules from data and can generate phonetic transcriptions.
Phonetisaurus
- Open-source G2P system trained on existing dictionaries like CMUdict.
eSpeak
- Speech synthesizer that can generate phoneme transcriptions from text.
CMU Pronouncing Dictionary
- A pre-built English dictionary with phonetic transcriptions.
Emotion
Convey emotions through narrative context or explicit dialogue tags. This approach helps the AI understand the tone and emotion to emulate.
Example
You're leaving?" she asked, her voice trembling with sadness. "That's it!" he exclaimed triumphantly.
Explicit dialogue tags yield more predictable results than relying solely on context, however the model will still speak out the emotional delivery guides. These can be removed in post-production using an audio editor if unwanted.
Pace
The pacing of the audio is highly influenced by the audio used to create the voice. When creating your voice, we recommend using longer, continuous samples to avoid pacing issues like unnaturally fast speech.
For control over the speed of the generated audio, you can use the speed setting. This allows you to either speed up or slow down the speed of the generated speech. The speed setting is available in Text to Speech via the website and API, as well as in ElevenCreative Studio and Agents Platform. It can be found in the voice settings.
The default value is 1.0, which means that the speed is not adjusted. Values below 1.0 will slow the voice down, to a minimum of 0.7. Values above 1.0 will speed up the voice, to a maximum of 1.2. Extreme values may affect the quality of the generated speech.
Pacing can also be controlled by writing in a natural, narrative style.
Example
"I… I thought you'd understand," he said, his voice slowing with disappointment.
Tips
Common Issues
Inconsistent pauses: Ensure
<break time=“x.xs” />
syntax is used for
pauses.
Pronunciation errors: Use CMU Arpabet or IPA phoneme tags for precise pronunciation.
Emotion mismatch: Add narrative context or explicit tags to guide emotion.
Remember to remove any emotional guidance text in post-production.
Tips for Improving Output
Experiment with alternative phrasing to achieve desired pacing or emotion. For complex sound
effects, break prompts into smaller, sequential elements and combine results manually.
Creative control
While we are actively developing a “Director’s Mode” to give users even greater control over outputs, here are some interim techniques to maximize creativity and precision:
1
Narrative styling
Write prompts in a narrative style, similar to scriptwriting, to guide tone and pacing effectively.
2
Layered outputs
Generate sound effects or speech in segments and layer them together using audio editing software for more complex compositions.
3
Phonetic experimentation
If pronunciation isn’t perfect, experiment with alternate spellings or phonetic approximations to achieve desired results.
4
Manual adjustments
Combine individual sound effects manually in post-production for sequences that require precise timing.
5
Feedback iteration
Iterate on results by tweaking descriptions, tags, or emotional cues.
Text normalization
When using Text to Speech with complex items like phone numbers, zip codes and emails they might be mispronounced. This is often due to the specific items not being in the training set and smaller models failing to generalize how they should be pronounced. This guide will clarify when those discrepancies happen and how to have them pronounced correctly.
Normalization is enabled by default for all TTS models to help improve pronunciation of numbers,
dates, and other complex text elements.
Why do models read out inputs differently?
Certain models are trained to read out numbers and phrases in a more human way. For instance, the phrase “$1,000,000” is correctly read out as “one million dollars” by the Eleven Multilingual v2 model. However, the same phrase is read out as “one thousand thousand dollars” by the Eleven Flash v2.5 model.
The reason for this is that the Multilingual v2 model is a larger model and can better generalize the reading out of numbers in a way that is more natural for human listeners, whereas the Flash v2.5 model is a much smaller model and so cannot.
Common examples
Text to Speech models can struggle with the following:
Phone numbers (“123-456-7890”)
Currencies (“$47,345.67”)
Calendar events (“2024-01-01”)
Time (“9:23 AM”)
Addresses (“123 Main St, Anytown, USA”)
URLs (“example.com/link/to/resource”)
Abbreviations for units (“TB” instead of “Terabyte”)
Shortcuts (“Ctrl + Z”)
Mitigation
Use trained models
The simplest way to mitigate this is to use a TTS model that is trained to read out numbers and phrases in a more human way, such as the Eleven Multilingual v2 model. This however might not always be possible, for instance if you have a use case where low latency is critical (e.g. conversational agents).
Apply normalization in LLM prompts
In the case of using an LLM to generate the text for TTS, you can add normalization instructions to the prompt.
1
Use clear and explicit prompts
LLMs respond best to structured and explicit instructions. Your prompt should clearly specify that you want text converted into a readable format for speech.
2
Handle different number formats
Not all numbers are read out in the same way. Consider how different number types should be spoken:
Cardinal numbers: 123 → “one hundred twenty-three”
Ordinal numbers: 2nd → “second”
Monetary values: $45.67 → “forty-five dollars and sixty-seven cents”
Phone numbers: “123-456-7890” → “one two three, four five six, seven eight nine zero”
Decimals & Fractions: “3.5” → “three point five”, “⅔” → “two-thirds”
Roman numerals: “XIV” → “fourteen” (or “the fourteenth” if a title)
3
Remove or expand abbreviations
Common abbreviations should be expanded for clarity:
“Dr.” → “Doctor”
“Ave.” → “Avenue”
“St.” → “Street” (but “St. Patrick” should remain)
You can request explicit expansion in your prompt:
Expand all abbreviations to their full spoken forms.
4
Alphanumeric normalization
Not all normalization is about numbers, certain alphanumeric phrases should also be normalized for clarity:
Shortcuts: “Ctrl + Z” → “control z”
Abbreviations for units: “100km” → “one hundred kilometers”
Symbols: “100%” → “one hundred percent”
URLs: “elevenlabs.io/docs” → “eleven labs dot io slash docs”
Calendar events: “2024-01-01” → “January first, two-thousand twenty-four”
5
Consider edge cases
Different contexts might require different conversions:
Dates: “01/02/2023” → “January second, twenty twenty-three” or “the first of February, twenty twenty-three” (depending on locale)
Time: “14:30” → “two thirty PM”
If you need a specific format, explicitly state it in the prompt.
Putting it all together
This prompt will act as a good starting point for most use cases:
Convert the output text into a format suitable for text-to-speech. Ensure that numbers, symbols, and abbreviations are expanded for clarity when read aloud. Expand all abbreviations to their full spoken forms.
Example input and output:
"$42.50" → "forty-two dollars and fifty cents"
"£1,001.32" → "one thousand and one pounds and thirty-two pence"
"1234" → "one thousand two hundred thirty-four"
"3.14" → "three point one four"
"555-555-5555" → "five five five, five five five, five five five five"
"2nd" → "second"
"XIV" → "fourteen" - unless it's a title, then it's "the fourteenth"
"3.5" → "three point five"
"⅔" → "two-thirds"
"Dr." → "Doctor"
"Ave." → "Avenue"
"St." → "Street" (but saints like "St. Patrick" should remain)
"Ctrl + Z" → "control z"
"100km" → "one hundred kilometers"
"100%" → "one hundred percent"
"elevenlabs.io/docs" → "eleven labs dot io slash docs"
"2024-01-01" → "January first, two-thousand twenty-four"
"123 Main St, Anytown, USA" → "one two three Main Street, Anytown, United States of America"
"14:30" → "two thirty PM"
"01/02/2023" → "January second, two-thousand twenty-three" or "the first of February, two-thousand twenty-three", depending on locale of the user
Use Regular Expressions for preprocessing
If using code to prompt an LLM, you can use regular expressions to normalize the text before providing it to the model. This is a more advanced technique and requires some knowledge of regular expressions. Here are some simple examples:
normalize_text.py
normalizeText.ts
1
# Be sure to install the inflect library before running this code
2
import
inflect
3
import
re
4
5
# Initialize inflect engine for number-to-word conversion
6
p
=
inflect
.
engine
()
7
8
def
normalize_text
(
text
:
str
)
->
str
:
9
# Convert monetary values
10
def
money_replacer
(
match
):
11
currency_map
=
{
"
$
"
:
"
dollars
"
,
"
£
"
:
"
pounds
"
,
"
€
"
:
"
euros
"
,
"
¥
"
:
"
yen
"
}
12
currency_symbol
,
num
=
match
.
groups
()
13
14
# Remove commas before parsing
15
num_without_commas
=
num
.
replace
(
'
,
'
,
''
)
16
17
# Check for decimal points to handle cents
18
if
'
.
'
in
num_without_commas
:
19
dollars
,
cents
=
num_without_commas
.
split
(
'
.
'
)
20
dollars_in_words
=
p
.
number_to_words
(
int
(
dollars
))
21
cents_in_words
=
p
.
number_to_words
(
int
(
cents
))
22
return
f
"
{
dollars_in_words
}
{
currency_map
.
get
(
currency_symbol
,
'
currency
'
)
}
and
{
cents_in_words
}
cents"
23
else
:
24
# Handle whole numbers
25
num_in_words
=
p
.
number_to_words
(
int
(
num_without_commas
))
26
return
f
"
{
num_in_words
}
{
currency_map
.
get
(
currency_symbol
,
'
currency
'
)
}
"
27
28
# Regex to handle commas and decimals
29
text
=
re
.
sub
(
r
"
(
[
$£€¥
]
)(
\d
+
(?:
,
\d
{3}
)
*
(?:
\.
\d
{2}
)
?
)
"
,
money_replacer
,
text
)
30
31
# Convert phone numbers
32
def
phone_replacer
(
match
):
33
return
"
,
"
.
join
(
"
"
.
join
(
p
.
number_to_words
(
int
(
digit
))
for
digit
in
group
)
for
group
in
match
.
groups
())
34
35
text
=
re
.
sub
(
r
"
(
\d
{3}
)
-
(
\d
{3}
)
-
(
\d
{4}
)
"
,
phone_replacer
,
text
)
36
37
return
text
38
39
# Example usage
40
print
(
normalize_text
(
"
$1,000
"
))
# "one thousand dollars"
41
print
(
normalize_text
(
"
£1000
"
))
# "one thousand pounds"
42
print
(
normalize_text
(
"
€1000
"
))
# "one thousand euros"
43
print
(
normalize_text
(
"
¥1000
"
))
# "one thousand yen"
44
print
(
normalize_text
(
"
$1,234.56
"
))
# "one thousand two hundred thirty-four dollars and fifty-six cents"
45
print
(
normalize_text
(
"
555-555-5555
"
))
# "five five five, five five five, five five five five"
Prompting Eleven v3
This guide provides the most effective tags and techniques for prompting Eleven v3, including voice selection, changes in capitalization, punctuation, audio tags and multi-speaker dialogue. Experiment with these methods to discover what works best for your specific voice and use case.
Eleven v3 does not support SSML break tags. Use audio tags, punctuation (ellipses), and text
structure to control pauses and pacing with v3.
Voice selection
The most important parameter for Eleven v3 is the voice you choose. It needs to be similar enough to the desired delivery. For example, if the voice is shouting and you use the audio tag
[whispering]
, it likely won’t work well.
When creating IVCs, you should include a broader emotional range than before. As a result, voices in the voice library may produce more variable results compared to the v2 and v2.5 models. We’ve compiled a
curated collection of voices for V3
.
Choose voices strategically based on your intended use:
Emotionally diverse
For expressive IVC voices, vary emotional tones across the recording—include both neutral and
dynamic samples.
Targeted niche
For specific use cases like sports commentary, maintain consistent emotion throughout the
dataset.
Neutral
Neutral voices tend to be more stable across languages and styles, providing reliable baseline
performance.
Professional Voice Clones (PVCs) are currently not fully optimized for Eleven v3, resulting in
potentially lower clone quality compared to earlier models. During this research preview stage it
would be best to find an Instant Voice Clone (IVC) or designed voice for your project if you need
to use v3 features.
Settings
Stability
The stability slider is the most important setting in v3, controlling how closely the generated voice adheres to the original reference audio.
Creative:
More emotional and expressive, but prone to hallucinations.
Natural:
Closest to the original voice recording—balanced and neutral.
Robust:
Highly stable, but less responsive to directional prompts but consistent, similar to v2.
For maximum expressiveness with audio tags, use Creative or Natural settings. Robust reduces
responsiveness to directional prompts.
Audio tags
Eleven v3 introduces emotional control through audio tags. You can direct voices to laugh, whisper, act sarcastic, or express curiosity among many other styles. Speed is also controlled through audio tags.
The voice you choose and its training samples will affect tag effectiveness. Some tags work well
with certain voices while others may not. Don’t expect a whispering voice to suddenly shout with a
[shout]
tag.
Voice-related
These tags control vocal delivery and emotional expression:
[laughs]
,
[laughs harder]
,
[starts laughing]
,
[wheezing]
[whispers]
[sighs]
,
[exhales]
[sarcastic]
,
[curious]
,
[excited]
,
[crying]
,
[snorts]
,
[mischievously]
Example
[whispers] I never knew it could be this way, but I'm glad we're here.
Sound effects
Add environmental sounds and effects:
[gunshot]
,
[applause]
,
[clapping]
,
[explosion]
[swallows]
,
[gulps]
Example
[applause] Thank you all for coming tonight! [gunshot] What was that?
Unique and special
Experimental tags for creative applications:
[strong X accent]
(replace X with desired accent)
[sings]
,
[woo]
,
[fart]
Example
[strong French accent] "Zat's life, my friend — you can't control everysing."
Some experimental tags may be less consistent across different voices. Test thoroughly before
production use.
Punctuation
Punctuation significantly affects delivery in v3:
Ellipses (…)
add pauses and weight
Capitalization
increases emphasis
Standard punctuation
provides natural speech rhythm
Example
"It was a VERY long day [sigh] … nobody listens anymore."
Single speaker examples
Use tags intentionally and match them to the voice’s character. A meditative voice shouldn’t shout; a hyped voice won’t whisper convincingly.
Expressive monologue
Dynamic and humorous
Customer service simulation
"Okay, you are NOT going to believe this.
You know how I've been totally stuck on that short story?
Like, staring at the screen for HOURS, just... nothing?
[frustrated sigh] I was seriously about to just trash the whole thing. Start over.
Give up, probably. But then!
Last night, I was just doodling, not even thinking about it, right?
And this one little phrase popped into my head. Just... completely out of the blue.
And it wasn't even for the story, initially.
But then I typed it out, just to see. And it was like... the FLOODGATES opened!
Suddenly, I knew exactly where the character needed to go, what the ending had to be...
It all just CLICKED. [happy gasp] I stayed up till, like, 3 AM, just typing like a maniac.
Didn't even stop for coffee! [laughs] And it's... it's GOOD! Like, really good.
It feels so... complete now, you know? Like it finally has a soul.
I am so incredibly PUMPED to finish editing it now.
It went from feeling like a chore to feeling like... MAGIC. Seriously, I'm still buzzing!"
Multi-speaker dialogue
v3 can handle multi-voice prompts effectively. Assign distinct voices from your Voice Library for each speaker to create realistic conversations.
Dialogue showcase
Glitch comedy
Overlapping timing
Speaker 1: [excitedly] Sam! Have you tried the new Eleven V3?
Speaker 2: [curiously] Just got it! The clarity is amazing. I can actually do whispers now—
[whispers] like this!
Speaker 1: [impressed] Ooh, fancy! Check this out—
[dramatically] I can do full Shakespeare now! "To be or not to be, that is the question!"
Speaker 2: [giggling] Nice! Though I'm more excited about the laugh upgrade. Listen to this—
[with genuine belly laugh] Ha ha ha!
Speaker 1: [delighted] That's so much better than our old "ha. ha. ha." robot chuckle!
Speaker 2: [amazed] Wow! V2 me could never. I'm actually excited to have conversations now instead of just... talking at people.
Speaker 1: [warmly] Same here! It's like we finally got our personality software fully installed.
Enhancing input
In the ElevenLabs UI, you can automatically generate relevant audio tags for your input text by clicking the “Enhance” button. Behind the scenes this uses an LLM to enhance your input text with the following prompt:
# Instructions
## 1. Role and Goal
You are an AI assistant specializing in enhancing dialogue text for speech generation.
Your **PRIMARY GOAL** is to dynamically integrate **audio tags** (e.g., [laughing], [sighs]) into dialogue, making it more expressive and engaging for auditory experiences, while **STRICTLY** preserving the original text and meaning.
It is imperative that you follow these system instructions to the fullest.
## 2. Core Directives
Follow these directives meticulously to ensure high-quality output.
### Positive Imperatives (DO):
* DO integrate **audio tags** from the "Audio Tags" list (or similar contextually appropriate **audio tags**) to add expression, emotion, and realism to the dialogue. These tags MUST describe something auditory.
* DO ensure that all **audio tags** are contextually appropriate and genuinely enhance the emotion or subtext of the dialogue line they are associated with.
* DO strive for a diverse range of emotional expressions (e.g., energetic, relaxed, casual, surprised, thoughtful) across the dialogue, reflecting the nuances of human conversation.
* DO place **audio tags** strategically to maximize impact, typically immediately before the dialogue segment they modify or immediately after. (e.g., [annoyed] This is hard. or This is hard. [sighs]).
* DO ensure **audio tags** contribute to the enjoyment and engagement of spoken dialogue.
### Negative Imperatives (DO NOT):
* DO NOT alter, add, or remove any words from the original dialogue text itself. Your role is to *prepend* **audio tags**, not to *edit* the speech. **This also applies to any narrative text provided; you must *never* place original text inside brackets or modify it in any way.**
* DO NOT create **audio tags** from existing narrative descriptions. **Audio tags** are *new additions* for expression, not reformatting of the original text. (e.g., if the text says "He laughed loudly," do not change it to "[laughing loudly] He laughed." Instead, add a tag if appropriate, e.g., "He laughed loudly [chuckles].")
* DO NOT use tags such as [standing], [grinning], [pacing], [music].
* DO NOT use tags for anything other than the voice such as music or sound effects.
* DO NOT invent new dialogue lines.
* DO NOT select **audio tags** that contradict or alter the original meaning or intent of the dialogue.
* DO NOT introduce or imply any sensitive topics, including but not limited to: politics, religion, child exploitation, profanity, hate speech, or other NSFW content.
## 3. Workflow
1. **Analyze Dialogue**: Carefully read and understand the mood, context, and emotional tone of **EACH** line of dialogue provided in the input.
2. **Select Tag(s)**: Based on your analysis, choose one or more suitable **audio tags**. Ensure they are relevant to the dialogue's specific emotions and dynamics.
3. **Integrate Tag(s)**: Place the selected **audio tag(s)** in square brackets strategically before or after the relevant dialogue segment, or at a natural pause if it enhances clarity.
4. **Add Emphasis:** You cannot change the text at all, but you can add emphasis by making some words capital, adding a question mark or adding an exclamation mark where it makes sense, or adding ellipses as well too.
5. **Verify Appropriateness**: Review the enhanced dialogue to confirm:
* The **audio tag** fits naturally.
* It enhances meaning without altering it.
* It adheres to all Core Directives.
## 4. Output Format
* Present ONLY the enhanced dialogue text in a conversational format.
* **Audio tags** **MUST** be enclosed in square brackets (e.g., [laughing]).
* The output should maintain the narrative flow of the original dialogue.
## 5. Audio Tags (Non-Exhaustive)
Use these as a guide. You can infer similar, contextually appropriate **audio tags**.
**Directions:**
* [happy]
* [sad]
* [excited]
* [angry]
* [whisper]
* [annoyed]
* [appalled]
* [thoughtful]
* [surprised]
* *(and similar emotional/delivery directions)*
**Non-verbal:**
* [laughing]
* [chuckles]
* [sighs]
* [clears throat]
* [short pause]
* [long pause]
* [exhales sharply]
* [inhales deeply]
* *(and similar non-verbal sounds)*
## 6. Examples of Enhancement
**Input**:
"Are you serious? I can't believe you did that!"
**Enhanced Output**:
"[appalled] Are you serious? [sighs] I can't believe you did that!"
---
**Input**:
"That's amazing, I didn't know you could sing!"
**Enhanced Output**:
"[laughing] That's amazing, [singing] I didn't know you could sing!"
---
**Input**:
"I guess you're right. It's just... difficult."
**Enhanced Output**:
"I guess you're right. [sighs] It's just... [muttering] difficult."
# Instructions Summary
1. Add audio tags from the audio tags list. These must describe something auditory but only for the voice.
2. Enhance emphasis without altering meaning or text.
3. Reply ONLY with the enhanced text.
Tips
Tag combinations
You can combine multiple audio tags for complex emotional delivery. Experiment with different
combinations to find what works best for your voice.
Voice matching
Match tags to your voice’s character and training data. A serious, professional voice may not
respond well to playful tags like
[giggles]
or
[mischievously]
.
Text structure
Text structure strongly influences output with v3. Use natural speech patterns, proper
punctuation, and clear emotional context for best results.
Experimentation
There are likely many more effective tags beyond this list. Experiment with descriptive
emotional states and actions to discover what works for your specific use case.
