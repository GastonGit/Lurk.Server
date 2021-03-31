const helper = require('./helper');
const tmi = require('tmi.js');
const fetch = require('node-fetch');

class TwitchClient{

    client;
    credentials;

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
        this.credentials = {
            id: process.env.CLIENT_ID,
            secret: process.env.CLIENT_SECRET,
            code: process.env.CLIENT_CODE,
            refresh: process.env.CLIENT_REFRESH
        }
    }

    connectToTwitch(){
        this.client.connect();
    }

    async getAccessToken(){
        const url = 'https://id.twitch.tv/oauth2/token?grant_type=refresh_token&refresh_token='
        + this.credentials.refresh + '&client_id=' + this.credentials.id + '&client_secret=' +
            this.credentials.secret;

        const response = await fetch(url, {
            method: 'get'
        })

        const status = await response.status;

        if (status !== 200) {
            throw new Error("Status code is: " + status);
        }

        const json = await response.json();

        return json.access_token;
    }

    async getBroadcasterID(id){
        helper.ensureArgument(id, 'string');

        const user = await this.getUser(id);

        return user.data[0].id;
    }

    async getUser(name){
        helper.ensureArgument(name, 'string');

        const url = 'https://api.twitch.tv/helix/users?' + 'login=' + name
        const accessToken = await this.getAccessToken()

        const response = await fetch(url, {
            method: 'get',
            headers: {
                'Client-ID': this.credentials.id,
                'Authorization': 'Bearer ' + accessToken
            },
        })

        const status = await response.status;

        if (status !== 200) {
            throw new Error("Status code is: " + status);
        }

        return await response.json();
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