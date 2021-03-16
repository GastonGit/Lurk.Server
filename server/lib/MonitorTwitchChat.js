const tmi = require('tmi.js');
const fetch = require('node-fetch');

class MonitorTwitchChat{

    streamList;

    constructor() {

        this.streamList = [];
    }

    getStreamList(){
        return this.streamList;
    }

    updateStreamList(response){
        if (typeof response === "undefined"){
            throw new Error("Argument is undefined");
        }

        let streamList = this.streamList;

        response["data"].forEach(function(channel){
            streamList.push({
                user_name: channel.user_name,
                viewer_count: channel.viewer_count
            })
        })
    }

    requestStreams(){
        return {};
    }

    async request20Streams(){
        const response = await fetch('https://api.twitch.tv/helix/streams', {
            method: 'get',
            headers: {
                'Client-ID': process.env.MTC_CLIENT_ID,
                'Authorization': ' Bearer ' + process.env.MTC_AUTH
            },
        })

        return await response.json();
    }
}

module.exports = MonitorTwitchChat;