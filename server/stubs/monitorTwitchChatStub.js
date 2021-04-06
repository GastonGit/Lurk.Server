const helper = require('../lib/helper');

class MonitorTwitchChat{

    streamList;
    requestCount;
    validMessages;
    client;
    compactStreamList;

    constructor(client, options) {

    }
    async connectToTwitch(){

    }

    async joinChannels(){

    }

    decreaseHits(amount){
        helper.ensureArgument(amount, 'number');
    }

    setCompactStreamList(){

    }

    getCompactStreamList(){
    }

    onMessageHandler(channel, context, message, self){

    }

    getStreamList(){

    }

    resetStreamer(channel){
        helper.ensureArgument(channel, 'string');
    }

    resetAllStreamers(){

    }

    getStreamerIndex(channel){
        helper.ensureArgument(channel, 'string');
    }

    async updateStreamList(){

    }
}

module.exports = MonitorTwitchChat;