# Add pronunciation dictionary rules | ElevenLabs Documentation
Source: https://elevenlabs.io/docs/api-reference/pronunciation-dictionaries/rules/add

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
Text to Dialogue
Voice Changer
Voice Design
Sound Effects
Audio Isolation
Dubbing
Forced Alignment
Pronunciation Dictionaries
POST
Create a pronunciation dictionary from a file
POST
Create a pronunciation dictionary from rules
GET
Get pronunciation dictionary
PATCH
Update Pronunciation Dictionary
GET
Get pronunciation dictionary by version
GET
List pronunciation dictionaries
Rules
POST
Set pronunciation dictionary rules
POST
Add pronunciation dictionary rules
POST
Remove pronunciation dictionary rules
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
Pronunciation Dictionaries
Rules
Add pronunciation dictionary rules
Copy page
POST
https://
api.elevenlabs.io
/
v1
/
pronunciation-dictionaries
/
:
pronunciation_dictionary_id
/
add-rules
POST
/
v1
/
pronunciation-dictionaries
/
:
pronunciation_dictionary_id
/
add-rules
cURL
$
curl
-X
POST
https://api.elevenlabs.io/v1/pronunciation-dictionaries/pronunciation_dictionary_id/add-rules
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
"rules": [
>
{
>
"alias": "string",
>
"string_to_replace": "string",
>
"type": "string"
>
}
>
]
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
id
"
:
"
5xM3yVvZQKV0EfqQpLrJ
"
,
3
"
version_id
"
:
"
5xM3yVvZQKV0EfqQpLr2
"
,
4
"
version_rules_num
"
:
5
5
}
Add rules to the pronunciation dictionary. If a rule with the same string_to_replace already exists, it will be replaced.
Path parameters
pronunciation_dictionary_id
string
Required
The id of the pronunciation dictionary
Headers
xi-api-key
string
Optional
Request
This endpoint expects an object.
rules
list of objects
Required
List of pronunciation rules. Rule can be either:
an alias rule: {‘string_to_replace’: ‘a’, ‘type’: ‘alias’, ‘alias’: ‘b’, }
or a phoneme rule: {‘string_to_replace’: ‘a’, ‘type’: ‘phoneme’, ‘phoneme’: ‘b’, ‘alphabet’: ‘ipa’ }
Response
Successful Response
id
string
The ID of the pronunciation dictionary.
version_id
string
The version ID of the pronunciation dictionary.
version_rules_num
integer
The number of rules in the version of the pronunciation dictionary.
Errors
422
Unprocessable Entity Error
