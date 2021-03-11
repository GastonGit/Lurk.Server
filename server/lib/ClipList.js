
class ClipList {

    currentList;

    constructor() {
        this.currentList = [];
    }

    getList(){
        return this.currentList;
    }
}

let cl = new ClipList();
module.exports = cl;