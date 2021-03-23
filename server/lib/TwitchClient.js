const tmi = require('tmi.js');

class TwitchClient{

    client;
    credentials;

    constructor() {
        this.client = new tmi.client({
            identity:{
                username: process.env.BOT_NAME,
                password: process.env.BOT_AUTH
            }
        })
        this.credentials = {
            id: process.env.CLIENT_ID,
            secret: process.env.CLIENT_SECRET,
            code: process.env.CLIENT_CODE
        }
    }

    connectToTwitch(){
        this.client.connect();
    }

    setMessageHandler(messageHandler){
        this.client.on('message', messageHandler);
    }

    joinChannels(channels){
        const client = this.client
        channels.forEach(function(channel){
            client.join(channel)
        })
    }
}

module.exports = TwitchClient;