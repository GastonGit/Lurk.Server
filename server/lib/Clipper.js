
class Clipper{

    constructor() {

    }

    createClip(broadcasterId){
        if (typeof broadcasterId === "undefined"){
            throw new Error("Argument is undefined");
        }

        return {};
    }

    getClip(clipId){
        if (typeof clipId === "undefined"){
            throw new Error("Argument is undefined");
        }

        return {};
    }
}

module.exports = Clipper;