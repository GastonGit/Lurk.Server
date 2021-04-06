
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

    async setupConnection(){
        await this.monitorTwitchChat.updateStreamList();
        await this.monitorTwitchChat.connectToTwitch();
        await this.monitorTwitchChat.joinChannels();
    }

    getList(){
        return this.clipList.getList();
    }
}

module.exports = HotClipsController;