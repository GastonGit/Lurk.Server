|Build|
|----|
| [![Node.js CI](https://github.com/GastonGit/Hot-Twitch-Clips/actions/workflows/node.js.yml/badge.svg)](https://github.com/GastonGit/Hot-Twitch-Clips/actions/workflows/node.js.yml) |
# Hot Clips
Automatically clips exciting and funny moments from Twitch in real-time and then showcases them on a website.

# Features
- Clip live Twitch streamers who are undergoing a spike in emote usage
- Options for deciding both emotes to watch and sensitivity
- Cycle the latest clipped clips on a minimalistic website

# Development
## [Milestones](https://github.com/GastonGit/Hot-Twitch-Clips/milestones)

# FAQ
## APIs
- [Twitch](https://dev.twitch.tv/docs/api/reference)
- [TMI.JS](https://github.com/tmijs/docs/tree/gh-pages/_posts/v1.4.2)
## How to set up
### Requirements
- A Twitch account
    - Required for creating an application
    - Will also be used to create clips
    
### Guide to server environment variables
##### BOT_NAME
The name of the Twitch account to be used when creating clips.

##### BOT_AUTH
Generate an OAuth password for tmi.js by going to https://twitchapps.com/tmi/. 
Remember to remove "oauth:" from the string.

##### CLIENT_ID & CLIENT_SECRET
1. Authorize Twitch dev by logging in with Twitch at https://dev.twitch.tv
2. Register an application at https://dev.twitch.tv/console and set OAuth Redirect URLS to http://localhost/.

##### CLIENT_CODE
Go to: https://id.twitch.tv/oauth2/authorize?client_id={{CLIENT_ID}}&redirect_uri=http://localhost/&response_type=code&scope=clips:edit. 

The string is in the url.
##### CLIENT_REFRESH
Make a POST request to https://id.twitch.tv/oauth2/token?client_id={{CLIENT_ID}}&client_secret={{CLIENT_SECRET}}&code={{CODE}}&grant_type=authorization_code&redirect_uri=http://localhost/

##### CLIENT_APP_ACCESS_TOKEN
Make a POST request to https://id.twitch.tv/oauth2/token?client_id={{CLIENT_ID}}&client_secret={{CLIENT_SECRET}}&grant_type=client_credentials