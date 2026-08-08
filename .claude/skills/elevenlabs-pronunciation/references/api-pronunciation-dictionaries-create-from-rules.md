# Create a pronunciation dictionary from rules | ElevenLabs Documentation
Source: https://elevenlabs.io/docs/api-reference/pronunciation-dictionaries/create-from-rules

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
Create a pronunciation dictionary from rules
Copy page
POST
https://
api.elevenlabs.io
/
v1
/
pronunciation-dictionaries
/
add-from-rules
POST
/
v1
/
pronunciation-dictionaries
/
add-from-rules
cURL
$
curl
-X
POST
https://api.elevenlabs.io/v1/pronunciation-dictionaries/add-from-rules
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
],
>
"name": "My Dictionary"
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
name
"
:
"
My Dictionary
"
,
4
"
created_by
"
:
"
ar6633Es2kUjFXBdR1iVc9ztsXl1
"
,
5
"
creation_time_unix
"
:
1714156800
,
6
"
version_id
"
:
"
5xM3yVvZQKV0EfqQpLrJ
"
,
7
"
version_rules_num
"
:
5
,
8
"
permission_on_resource
"
:
"
admin
"
,
9
"
description
"
:
"
This is a test dictionary
"
10
}
Creates a new pronunciation dictionary from provided rules.
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
name
string
Required
The name of the pronunciation dictionary, used for identification only.
description
string or null
Optional
A description of the pronunciation dictionary, used for identification only.
workspace_access
enum or null
Optional
Should be one of 'admin', 'editor' or 'viewer'. If not provided, defaults to no access.
Response
Successful Response
id
string
The ID of the created pronunciation dictionary.
name
string
The name of the created pronunciation dictionary.
created_by
string
The user ID of the creator of the pronunciation dictionary.
creation_time_unix
integer
The creation time of the pronunciation dictionary in Unix timestamp.
version_id
string
The ID of the created pronunciation dictionary version.
version_rules_num
integer
The number of rules in the version of the pronunciation dictionary.
permission_on_resource
enum or null
The permission on the resource of the pronunciation dictionary.
description
string or null
Optional
The description of the pronunciation dictionary.
Errors
422
Unprocessable Entity Error
