const tmi = require('tmi.js');
const fetch = require('node-fetch');

class MonitorTwitchChat{

    streamList;
    requestCount;
    validMessages;

    constructor(options) {
        this.requestCount = options.requestCount || 2;
        this.streamList = [];
        this.validMessages = [
            'LUL',
            'LULW',
            'OMEGALUL',
            'LuL'
        ]
    }

    onMessageHandler(channel, context, message, self){

        if (!this.validMessages.includes(message)){
            return;
        }

        let userObject = this.streamList.find(streamer => streamer.user_name === channel.toLowerCase())
        let userIndex = this.streamList.indexOf(userObject);

        this.streamList[userIndex].hits += 1;
    }

    getStreamList(){
        return this.streamList;
    }

    async updateStreamList(){
        this.streamList = await this.requestStreams();
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