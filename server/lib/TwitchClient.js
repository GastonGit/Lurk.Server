const tmi = require('tmi.js');
const fetch = require('node-fetch');

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
            code: process.env.CLIENT_CODE,
            auth: process.env.CLIENT_AUTH
        }
    }

    connectToTwitch(){
        this.client.connect();
    }

    async getBroadcasterID(id){
        if (typeof id === "undefined"){
            throw new Error("Argument is undefined");
        }

        const user = await this.getUser(id);

        return user.data[0].id;
    }

    async getUser(name){
        if (typeof name === "undefined"){
            throw new Error("Argument is undefined");
        }

        const url = 'https://api.twitch.tv/helix/users?' + 'login=' + name

        const response = await fetch(url, {
            method: 'get',
            headers: {
                'Client-ID': this.credentials.id,
                'Authorization': 'Bearer ' + this.credentials.auth
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