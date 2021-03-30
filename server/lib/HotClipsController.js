
let ClipList = require("./ClipList");
let MonitorTwitchChat = require('./MonitorTwitchChat');
let TwitchClient = require('./TwitchClient');

class HotClipsController{

    clipList;
    monitorTwitchChat;

    constructor() {
        this.monitorTwitchChat = new MonitorTwitchChat(
            new TwitchClient(),
            {
            requestCount: undefined,
            validMessages: undefined
        });
        this.clipList = new ClipList();
    }

    getList(){
        return this.clipList.getList();
    }
}

module.exports = HotClipsController;