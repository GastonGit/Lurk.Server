require('dotenv').config();
const helper = require('./helper');

class Clipper{

    authorization;
    client_id;

    constructor() {
        this.authorization = process.env.CLIPPER_AUTH;
        this.client_id = process.env.CLIPPER_CLIENT_ID;
    }

    createClip(broadcaster_id){
        helper.ensureArgument(broadcaster_id)

        return {};
    }

    getClip(clip_id){
        helper.ensureArgument(clip_id)

        return {};
    }
}

module.exports = Clipper;