|Build|
|----|
| [![Node.js CI](https://github.com/GastonGit/Hot-Twitch-Clips/actions/workflows/node.js.yml/badge.svg)](https://github.com/GastonGit/Hot-Twitch-Clips/actions/workflows/node.js.yml) |
# Hot Clips
Automatically clips exciting and funny moments from Twitch in real-time and then showcases them on a website.

![GIF Preview](client/public/HotClips.gif)

# Features
- Clip live Twitch streamers who are undergoing a spike in emote usage
- Options for deciding both emotes to watch and sensitivity
- Cycle the latest clipped clips on a minimalistic website

# FAQ
### Why do I have to manually unmute?
Because Chrome does not allow websites to autoplay unmuted videos, for more details see https://developers.google.com/web/updates/2017/09/autoplay-policy-changes
### Why does X streamer never show up?
They might have been manually  filtered for various reasons

# Development
## [Milestones](https://github.com/GastonGit/Hot-Twitch-Clips/milestones)
## APIs
- [Twitch](https://dev.twitch.tv/docs/api/reference)
- [TMI.JS](https://github.com/tmijs/docs/tree/gh-pages/_posts/v1.4.2)
## How to set up
- [Setup client](client/README.md)
- [Setup server](server/README.md)