const fetch = require('node-fetch');
const helper = require('./helper');

class MonitorTwitchChat{

    streamList;
    requestCount;
    validMessages;
    client;
    compactStreamList;

    constructor(client, options) {
        this.requestCount = options.requestCount || 2;
        this.streamList = [];
        this.validMessages = options.validMessages || ['OMEGALUL']
        this.compactStreamList = [];
        this.client = client;
        this.client.setMessageHandler(this.onMessageHandler.bind(this));
    }

    async connectToTwitch(){
        await this.client.connectToTwitch();
    }

    async joinChannels(){
        this.setCompactStreamList();
        this.client.joinChannels(this.getCompactStreamList())
    }

    decreaseHits(amount){
        helper.ensureArgument(amount, 'number');

        this.streamList.forEach(function(streamer){
            if ((streamer.hits - amount) >= 0){
                streamer.hits = streamer.hits - amount;
            } else {
                streamer.hits = 0;
            }
        })
    }

    setCompactStreamList(){
        let compactStreamList = this.compactStreamList;
        this.streamList.forEach(function(streamer){
            compactStreamList.push(streamer.user_name);
        })
    }

    getCompactStreamList(){
        return this.compactStreamList;
    }

    onMessageHandler(channel, context, message, self){

        if (!this.validMessages.includes(message)){
            return;
        }

        this.streamList[this.getStreamerIndex(channel)].hits += 1;
    }

    getStreamList(){
        return this.streamList;
    }

    resetStreamer(channel){
        this.streamList[this.getStreamerIndex(channel)].hits = 0;
    }

    resetAllStreamers(){
        this.streamList.forEach(function(streamer){
            streamer.hits = 0;
        })
    }

    getStreamerIndex(channel){
        let userObject = this.streamList.find(streamer => streamer.user_name === channel.toLowerCase())
        return this.streamList.indexOf(userObject);
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