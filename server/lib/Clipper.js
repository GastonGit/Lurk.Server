require('dotenv').config();

class Clipper{

    authorization;
    client_id;

    constructor() {
        this.authorization = process.env.CLIPPER_AUTH;
        this.client_id = process.env.CLIPPER_CLIENT_ID;
    }

    createClip(broadcaster_id){
        if (typeof broadcaster_id === "undefined"){
            throw new Error("Argument is undefined");
        }

        return {};
    }

    getClip(clip_id){
        if (typeof clip_id === "undefined"){
            throw new Error("Argument is undefined");
        }

        return {};
    }
}

module.exports = Clipper;