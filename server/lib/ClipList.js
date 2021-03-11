
class ClipList {

    currentList;

    constructor() {
        this.currentList = [];
    }

    getList(){
        return this.currentList;
    }

    addClip(clip){
        if (typeof clip === 'string'){
            if (isTwitchClipUrl(clip)){
                this.currentList.push(clip);
                return true;
            }
        }

        return false;
    }
}

function isTwitchClipUrl(string){

    if (string.includes("https://clips.twitch.tv/") && string.indexOf("https://") === 0){

        let url = new URL(string);

        if (url.pathname.length > 1){
            return true;
        }
    }

    return false;
}

module.exports = ClipList;