const helper = require('./helper');

class ClipList {

    currentList;

    constructor() {
        this.currentList = [];
    }

    getList(){
        return this.currentList;
    }

    addClip(clip){
        helper.ensureArgument(clip, 'string');

        this.currentList.push(clip);
    }

    removeClip(){
        this.currentList.shift();
    }
}

module.exports = ClipList;