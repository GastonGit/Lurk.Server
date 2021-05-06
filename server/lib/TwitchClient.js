const helper = require('./helper');
const tmi = require('tmi.js');

class TwitchClient{

    client;
    joinTimeout;

    constructor(joinTimeout) {
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
        this.joinTimeout = joinTimeout || 200;
    }

    async connectToTwitch(){
        return this.client.connect()
            .then((data) => {
                return data;
            }).catch((err) => {
                return 'Error connecting to Twitch: ' + err;
            });
    }

    setMessageHandler(messageHandler){
        helper.ensureArgument(messageHandler, 'function');

        this.client.on('message', messageHandler);
    }

    joinChannels(channels){
        helper.ensureArgument(channels, 'array');

        console.log('\x1b[44m%s\x1b[0m','\n--- TwitchClient :: Joining channels')

        const client = this.client
        for (let i = 0; i < channels.length; i++){
            setTimeout(() => {
                client.join(channels[i])
                    .then((data) => {
                        console.log(data[0].substring(data[0].indexOf('#') + 1));
                    }).catch((err) => {
                    console.error('\x1b[31m%s\x1b[0m',err + ' :: ERROR :: ' + channels[i]);
                });
            }, this.joinTimeout * (i+1));
        }
    }
}

module.exports = TwitchClient;