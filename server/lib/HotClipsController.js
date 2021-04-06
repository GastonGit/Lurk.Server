const helper = require('./helper');

let ClipList = require("./ClipList");
let MonitorTwitchChat = require('./MonitorTwitchChat');
let TwitchClient = require('./TwitchClient');

class HotClipsController{

    clipList;
    monitorTwitchChat;
    timer;

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

    start(){
        this.startTimer(function (){this.checkForSpikes(5);}, 800);
    }

    startTimer(func, time){
        this.timer = setInterval((func).bind(this),time);
    }

    endTimer(){
        clearInterval(this.timer);
    }

    checkForSpikes(spike){
        helper.ensureArgument(spike, 'number');

        const list = this.getStreamList();
    }

    async clipIt(streamer){
        helper.ensureArgument(streamer, 'string');

        this.resetHits(streamer);
        const clip = await this.createClip(streamer);
        this.addClip(clip);
    }

    getStreamList(){
        return this.monitorTwitchChat.getStreamList();
    }

    addClip(clip){
        helper.ensureArgument(clip, 'string');

        this.clipList.addClip(clip);
    }

    async createClip(streamer){
        helper.ensureArgument(streamer, 'string');

        return 'twitchclip';
    }

    resetHits(streamer){
        helper.ensureArgument(streamer, 'string');
    }

    getList(){
        return this.clipList.getList();
    }
}

module.exports = HotClipsController;