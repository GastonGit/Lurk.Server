
class Clipper{

    constructor() {

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