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
        return [
            {user_name:"nymn", viewer_count:0, hits:5},
            {user_name:"forsen", viewer_count:45, hits:50},
            {user_name:"moonmoon", viewer_count:123, hits:100},
            {user_name:"sodapoppin", viewer_count:50, hits:60},
        ];
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