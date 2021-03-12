
class Clipper{

    constructor() {

    }

    getClip(clipId){
        if (typeof clipId === "undefined"){
            throw new Error("Argument is undefined");
        }

        return {};
    }
}

module.exports = Clipper;