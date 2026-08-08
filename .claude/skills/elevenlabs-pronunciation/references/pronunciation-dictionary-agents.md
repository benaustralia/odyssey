# Pronunciation dictionaries | ElevenLabs Documentation
Source: https://elevenlabs.io/docs/eleven-agents/customization/voice/pronunciation-dictionary

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
Overview
Quickstart
Configure
Overview
Agent behavior
Voice & language
Multi-voice support
Pronunciation dictionary
Speed control
Expressive mode
Voice design
Language
Knowledge base
Tools
Personalization
Authentication
Integrations
Deploy
Overview
Environment variables
Web
Mobile
Server
Telephony
WhatsApp
Batch calls
Monitor
Overview
Users
Testing
Experiments
Versioning
Conversation analysis
Analytics
Spotlight
Real-time monitoring
OpenTelemetry traces
Privacy
Cost optimization
CLI
Hosted MCP
Advanced
Events
Custom models
LLM cascading
Post-call webhooks
Resources
SDKs
UI components
Guides
Quickstarts
Chat Mode
Burst pricing
ElevenLabs' docs agent
Scaling user interviews
Simulate Conversations
No-Code
Cookbooks
API reference
Legal
Deprecations
Connect
Blog
Help Center
API Pricing
Sign up
Light
On this page
Overview
Configuration
Attach a dictionary to your agent
Dictionary file format
Supported formats
Best practices
FAQ
Additional resources
Scroll to top
Configure
Voice & language
Pronunciation dictionaries
Copy page
Learn how to control how your AI agent pronounces specific words and phrases.
Overview
Pronunciation dictionaries allow you to customize how your AI agent pronounces specific words or phrases. This is particularly useful for:
Correcting pronunciation of names, places, or technical terms
Ensuring consistent pronunciation across conversations
Customizing regional pronunciation variations
Configuration
Pronunciation dictionary phoneme tags only work with eleven_flash_v2  and eleven_v3 models.
Other models skip dictionary phoneme tags and use the default pronunciation. For other models, use
alias tags instead to substitute spellings or phrases that produce the pronunciation you need.
If you want to use IPA and CMU pronunciations in languages other than English, you will have to
switch to the eleven_v3 model.
Attach a dictionary to your agent
Update via the dashboard
Update via the CLI
Update via the API
Open your agent in the dashboard, navigate to
Voice Settings
, and add a pronunciation dictionary. Save your changes.
Dictionary file format
Pronunciation dictionaries use XML-based
.pls
files. Here’s an example structure:
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
Apple
</
grapheme
>
10
<
phoneme
>
ˈæpl̩
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
Supported formats
Pronunciation dictionaries support two types of pronunciation notation:
IPA (International Phonetic Alphabet)
More precise control over pronunciation
Requires knowledge of IPA symbols
Example: “nginx” as
/ˈɛndʒɪnˈɛks/
CMU (Carnegie Mellon University) Dictionary format
Simpler ASCII-based format
More accessible for English pronunciations
Example: “tomato” as “T AH M EY T OW”
You can use AI tools like Claude or ChatGPT to help generate IPA or CMU notations for specific
words.
Best practices
Case sensitivity
: Create separate entries for capitalized and lowercase versions of words if needed
Testing
: Always test pronunciations with your chosen voice and model
Maintenance
: Keep your dictionary organized and documented
Scope
: Focus on words that are frequently mispronounced or critical to your use case
FAQ
Which models support phoneme-based pronunciation?
Pronunciation dictionary phoneme tags only work with eleven_flash_v2  and eleven_v3 models.
Other models skip dictionary phoneme tags and use the default pronunciation. For other models,
use alias tags instead to substitute spellings or phrases that produce the pronunciation you
need.
If you want to use IPA and CMU pronunciations in languages other than English, you will have to
switch to the eleven_v3 model.
Can I use multiple dictionaries?
Yes, you can upload multiple dictionary files to handle different sets of pronunciations.
What happens if a word isn't in the dictionary?
The model will use its default pronunciation rules for any words not specified in the
dictionary.
Additional resources
Professional Voice Cloning
Voice Design
Text to Speech API Reference
