const helper = require('./helper');
const tmi = require('tmi.js');

class TwitchClient{

    client;

    constructor() {
        this.client = new tmi.client({
            connection:{
                reconnect: true,
                secure: true
            },
            identity:{
                username: process.env.BOT_NAME,
                password: process.env.BOT_AUTH
            }
        })
    }

    connectToTwitch(){
        this.client.connect();
    }

    setMessageHandler(messageHandler){
        helper.ensureArgument(messageHandler, 'function');

        this.client.on('message', messageHandler);
    }

    joinChannels(channels){
        helper.ensureArgument(channels, 'array');

        const client = this.client
        channels.forEach(function(channel){
            client.join(channel)
        })
    }
}

module.exports = TwitchClient;