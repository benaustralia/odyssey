# Edit voice settings | ElevenLabs Documentation
Source: https://elevenlabs.io/docs/api-reference/voices/settings/update

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
Edit voice settings
Copy page
POST
https://
api.elevenlabs.io
/
v1
/
voices
/
:
voice_id
/
settings
/
edit
POST
/
v1
/
voices
/
:
voice_id
/
settings
/
edit
cURL
$
curl
-X
POST
https://api.elevenlabs.io/v1/voices/voice_id/settings/edit
\
>
-H
"
Content-Type: application/json
"
\
>
-d
'
{
>
"stability": 1,
>
"use_speaker_boost": true,
>
"similarity_boost": 1,
>
"style": 0,
>
"speed": 1
>
}
'
Try it
200
Successful
1
{
2
"
status
"
:
"
ok
"
3
}
Edit your settings for a specific voice. “similarity_boost” corresponds to “Clarity + Similarity Enhancement” in the web app and “stability” corresponds to “Stability” slider in the web app.
Path parameters
voice_id
string
Required
ID of the voice to be used. You can use the
Get voices
endpoint list all the available voices.
Headers
xi-api-key
string
Optional
Request
This endpoint expects an object.
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
Response
Successful Response
status
string
The status of the voice settings edit request. If the request was successful, the status will be 'ok'. Otherwise an error message with status 500 will be returned.
Errors
422
Unprocessable Entity Error
