[![Node.js CI](https://github.com/GastonGit/Hot-Twitch-Clips/actions/workflows/node.js.yml/badge.svg)](https://github.com/GastonGit/Hot-Twitch-Clips/actions/workflows/node.js.yml)
# Hot Clips
Automatically clips exciting and funny moments from Twitch in real-time and then showcases them on a website.

# Features
- Clip live Twitch streamers who are undergoing a spike in emote usage
- Options for deciding both emotes to watch and sensitivity
- Cycle the latest clipped clips on a minimalistic website

# FAQ
## APIs
- https://dev.twitch.tv/docs/api/reference
- https://github.com/tmijs/docs/tree/gh-pages/_posts/v1.4.2
## How to set up
### Requirements
- A Twitch account
    - Required for creating an application
    - Will also be used to create clips
    
### Guide to environment variables
1. Authorize Twitch dev by logging in with Twitch at https://dev.twitch.tv
2. Register an application at https://dev.twitch.tv/console and set OAuth Redirect URLS to http://localhost/
    1. CLIENT_ID="Client ID"
    2. CLIENT_SECRET="Client Secret" 
3. Give the application the right to use the Twitch account to create clips by:
    1. Going to https://id.twitch.tv/oauth2/authorize?client_id=<CLIENT_ID>&redirect_uri=http://localhost/&response_type=code&scope=clips:edit
    2. And getting the code fragment in the url you are redirected to.
4. Use Client ID, Client Secret and Code to get the refresh code by:
    1. Making a POST request to https://id.twitch.tv/oauth2/token?client_id=<CLIENT_ID>&client_secret=<CLIENT_SECRET>&code=<CODE>&grant_type=authorization_code&redirect_uri=http://localhost/
    2. CLIENT_REFRESH="refresh_token"
5. Generate an OAuth password for tmi.js by going to https://twitchapps.com/tmi/
    1. BOT_AUTH=(OAuth password without "oauth:")
### Additional environment variables
- BOT_NAME="Your Twitch account name"