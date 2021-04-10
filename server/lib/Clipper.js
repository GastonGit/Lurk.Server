require('dotenv').config();
const helper = require('./helper');
const fetch = require('node-fetch');

class Clipper{

    authorization;
    client_id;
    credentials;

    constructor() {
        this.authorization = process.env.CLIPPER_AUTH;
        this.client_id = process.env.CLIPPER_CLIENT_ID;
        this.credentials = {
            id: process.env.CLIENT_ID,
            secret: process.env.CLIENT_SECRET,
            code: process.env.CLIENT_CODE,
            refresh: process.env.CLIENT_REFRESH
        }
    }

    async createClip(streamer){
        helper.ensureArgument(streamer, 'string');

        if (process.env.NODE_ENV === 'test_values'){
            console.log('CLIP CREATED FOR: ' + streamer);
            return 'https://clips.twitch.tv/HealthyDelightfulEchidnaKappaPride';
        }

        const broadcasterID = await this.getBroadcasterID(streamer);

        const url = 'https://api.twitch.tv/helix/clips?broadcaster_id=' + broadcasterID.toLowerCase();
        const accessToken = await this.getAccessToken();

        const response = await fetch(url, {
            method: 'post',
            headers: {
                'Client-ID': this.credentials.id,
                'Authorization': 'Bearer ' + accessToken
            },
        })

        const result = await response.json();
        const slug = result.data[0].id;

        return 'https://clips.twitch.tv/' + slug;
    }

    getClip(clip_id){
        helper.ensureArgument(clip_id)

        return {};
    }

    async getAccessToken(){
        const url = 'https://id.twitch.tv/oauth2/token?grant_type=refresh_token&refresh_token='
            + this.credentials.refresh + '&client_id=' + this.credentials.id + '&client_secret=' +
            this.credentials.secret;

        const response = await fetch(url, {
            method: 'post',
        })

        const status = await response.status;

        if (status !== 200) {
            throw new Error("getAccessToken - status code is: " + status);
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

        const url = 'https://api.twitch.tv/helix/users?' + 'login=' + name.toLowerCase()
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
            throw new Error("getUser - status code is: " + status);
        }

        return await response.json();
    }
}

module.exports = Clipper;