const helper = require('./helper');

let ClipList = require("./ClipList");
let MonitorTwitchChat = require('./MonitorTwitchChat');
let TwitchClient = require('./TwitchClient');
let Clipper = require('./Clipper');

class HotClipsController{

    clipList;
    monitorTwitchChat;
    checkTimer;
    reduceTimer;
    clipper;

    spikeValue = 4;
    spikeTime = 400;
    reduceValue = 60;
    reduceTime = 3000;

    cooldownLengthInSeconds = 30;
    addClipDelay = 1;

    constructor() {
        this.monitorTwitchChat = new MonitorTwitchChat(
            new TwitchClient(),
            {
            requestCount: undefined,
            validMessages: ['OMEGALUL', 'LULW', 'LUL', 'KEKW']
        });
        this.clipList = new ClipList();
        this.clipper = new Clipper();
    }

    async setupConnection(){
        await this.monitorTwitchChat.updateStreamList();
        await this.monitorTwitchChat.connectToTwitch();
        await this.monitorTwitchChat.joinChannels();
    }

    start(){
        this.checkTimer = setInterval((function (){this.checkForSpikes(this.spikeValue);}).bind(this), this.spikeTime);
        this.reduceTimer = setInterval((function (){this.monitorTwitchChat.decreaseHits(this.reduceValue)}).bind(this),this.reduceTime)
    }

    endAllTimers(){
        clearInterval(this.checkTimer);
        clearInterval(this.reduceTimer);
    }

    checkForSpikes(spike){
        helper.ensureArgument(spike, 'number');

        const list = [...this.getStreamList()];

        for (let i = 0; i < list.length; i++){
            if (!list[i].cooldown){
                if (list[i].hits >= (spike + (parseInt(list[i].viewer_count)) / 5000)){
                    this.clipIt(list[i].user_name).catch((error) => {
                        console.error('Error during "clipIt": ' + error);
                    });
                }
            }
        }
    }

    async clipIt(streamer){
        helper.ensureArgument(streamer, 'string');

        this.cooldownStreamer(streamer);
        this.resetHits(streamer);
        const clip = await this.createClip(streamer);
        const videoURL = await this.getVideoUrl(clip.id);

        this.delayAddingClip(videoURL);
    }

    async getVideoUrl(slug){
        helper.ensureArgument(slug, 'string');

        return this.clipper.getVideoUrl(slug);
    }

    delayAddingClip(url){
        setTimeout(function(){
            this.addClip(url);
        }.bind(this), this.addClipDelay);
    }

    cooldownStreamer(streamer){
        helper.ensureArgument(streamer, 'string');

        this.monitorTwitchChat.cooldownStreamer(streamer, this.cooldownLengthInSeconds);
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

        return this.clipper.createClip(streamer);
    }

    resetHits(streamer){
        helper.ensureArgument(streamer, 'string');

        this.monitorTwitchChat.resetStreamer(streamer);
    }

    getList(){
        return this.clipList.getList();
    }
}

module.exports = HotClipsController;