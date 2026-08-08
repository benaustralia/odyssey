# Get default voice settings | ElevenLabs Documentation
Source: https://elevenlabs.io/docs/api-reference/voices/settings/get-default

Login
Overview
ElevenCreative
ElevenAgents
ElevenAPI
Reception.ai
API reference
Changelog
Help Center
API reference
Introduction
Authentication
Streaming
ElevenAgents
Agents
Conversations
Users
Tools
Knowledge Base
Tests
Phone Numbers
Widget
Workspace
SIP Trunk
Twilio
Exotel
WhatsApp
Batch Calling
LLM
MCP
Analytics
Environment Variables
ElevenAPI
Text to Speech
Speech to Text
Music
Speech Engine
Voices
Voice library
PVC
IVC
Samples
Settings
GET
Get default voice settings
GET
Get voice settings
POST
Edit voice settings
GET
Get voice
DEL
Delete voice
POST
Edit voice
GET
List voices
POST
Replicate Voice To Isolated Environment
POST
List similar voices
Accents
Text to Dialogue
Voice Changer
Voice Design
Sound Effects
Audio Isolation
Dubbing
Forced Alignment
Pronunciation Dictionaries
Audio Native
ElevenCreative
Studio
Core Resources
History
Models
Tokens
Workspace
Analytics
User
Service Accounts
API Keys
Workspace
Webhooks
Legacy
Voices
Knowledge Base
Dubbing
Usage
Connect
Blog
Help Center
API Pricing
Sign up
Light
ElevenAPI
Voices
Settings
Get default voice settings
Copy page
GET
https://
api.elevenlabs.io
/
v1
/
voices
/
settings
/
default
GET
/
v1
/
voices
/
settings
/
default
cURL
$
curl
https://api.elevenlabs.io/v1/voices/settings/default
Try it
200
Retrieved
1
{
2
"
stability
"
:
1
,
3
"
use_speaker_boost
"
:
true
,
4
"
similarity_boost
"
:
1
,
5
"
style
"
:
0
,
6
"
speed
"
:
1
7
}
Gets the default settings for voices. “similarity_boost” corresponds to”Clarity + Similarity Enhancement” in the web app and “stability” corresponds to “Stability” slider in the web app.
Headers
xi-api-key
string
Optional
Response
Successful Response
stability
double or null
Optional
0-1
Defaults to
0.5
Determines how stable the voice is and the randomness between each generation. Lower values introduce broader emotional range for the voice. Higher values can result in a monotonous voice with limited emotion.
use_speaker_boost
boolean or null
Optional
Defaults to
true
This setting boosts the similarity to the original speaker. Using this setting requires a slightly higher computational load, which in turn increases latency.
similarity_boost
double or null
Optional
0-1
Defaults to
0.75
Determines how closely the AI should adhere to the original voice when attempting to replicate it.
style
double or null
Optional
Defaults to
0
Determines the style exaggeration of the voice. This setting attempts to amplify the style of the original speaker. It does consume additional computational resources and might increase latency if set to anything other than 0.
speed
double or null
Optional
Defaults to
1
Adjusts the speed of the voice. A value of 1.0 is the default speed, while values less than 1.0 slow down the speech, and values greater than 1.0 speed it up.
