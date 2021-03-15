
let ClipList = require("./ClipList");

class HotClipsController{

    clipList;

    constructor() {
        this.clipList = new ClipList();
    }

    getList(){
        return this.clipList.getList();
    }
}

module.exports = HotClipsController;