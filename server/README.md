## Setting up server
- Install npm modules
- Setup environment variables

## Guide to server environment variables
### Requirements
- A Twitch account
    - Required for creating an application
    - Will also be used to create clips
##### BOT_NAME
The name of the Twitch account to be used when creating clips.

##### BOT_AUTH
Generate an OAuth password for tmi.js by going to https://twitchapps.com/tmi/ while logged into the account set in BOT_NAME.

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