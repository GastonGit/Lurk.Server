const helper = require('./helper');
const tmi = require('tmi.js');

class TwitchClient{

    client;
    joinTimeout;

    constructor(joinTimeout) {
        this.client = new tmi.client({
            connection:{
                reconnect: true,
                secure: true,
                reconnectInterval: 100000,
                maxReconnectInterval: 120000
            },
            identity:{
                username: process.env.BOT_NAME,
                password: process.env.BOT_AUTH
            }
        })
        this.joinTimeout = joinTimeout || 200;
    }

    async connectToTwitch(){
        /* istanbul ignore next */
        this.client.on("disconnected", (reason) => {
            console.error('\x1b[45m%s\x1b[0m','TMI.JS :: DISCONNECT :: ' + reason);
            throw Error ("UNABLE TO CONNECT");
        });

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

    async joinChannels(channels){
        helper.ensureArgument(channels, 'array');

        console.log('\x1b[44m%s\x1b[0m','\n--- TwitchClient :: Joining channels...')

        const client = this.client
        const promises = channels.map(async channel => {
            return await client.join(channel);
        })

        const result = await Promise.allSettled(promises)
        console.log(result.map(promise => promise.status));

        console.log('\x1b[44m%s\x1b[0m','\n--- TwitchClient :: ...Joined channels')
    }

    async leaveChannels(channels){
        helper.ensureArgument(channels, 'array');

        console.log('\x1b[44m%s\x1b[0m','\n--- TwitchClient :: Leaving channels...')

        const client = this.client
        const promises = channels.map(async channel => {
            return await client.part(channel);
        })

        const result = await Promise.allSettled(promises)
        console.log(result.map(promise => promise.status));

        console.log('\x1b[44m%s\x1b[0m','--- TwitchClient :: ...Left channels')
    }
}

module.exports = TwitchClient;