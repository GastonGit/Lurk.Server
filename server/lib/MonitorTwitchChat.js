const tmi = require('tmi.js');
const fetch = require('node-fetch');

class MonitorTwitchChat{

    streamList;
    requestCount;

    constructor(options) {
        this.requestCount = options.requestCount || 2;
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

    async requestStreams(){

        let streams = [];
        let pagination = undefined;

        for (let i = 0; i < this.requestCount; i++){
            const fetchedStreams = await this.request100Streams(pagination);

            fetchedStreams.data.forEach(function(streamer){
                streams.push({
                    user_name: streamer.user_name.toLowerCase(),
                    viewer_count: parseInt(streamer.viewer_count),
                    hits: 0
                })
            })

            pagination = fetchedStreams.pagination.cursor;
        }

        return streams;
    }

    async request100Streams(pagination){

        let url = "https://api.twitch.tv/helix/streams?first=100"

        if (pagination){
            url += '&after=' + pagination;
        }

        const response = await fetch(url, {
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