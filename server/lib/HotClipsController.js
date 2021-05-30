const helper = require('./helper');
let config;

/* istanbul ignore else */
if (process.env.NODE_ENV === 'test'){
    console.log('\x1b[44m%s\x1b[0m','\n--- HotClipsController :: Using settings from configTest.json\n')
    config = require('./settings/configTest.json');
} else {
    console.log('\x1b[44m%s\x1b[0m','\n--- HotClipsController :: Using settings from config.json\n')
    config = require('./settings/config.json');
}

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
    updateTimer;

    spikeValue = config.spikeValue;
    spikeTime = config.spikeTime;
    reduceValue = config.reduceValue;
    reduceTime = config.reduceTime;

    cooldownLengthInSeconds = config.cooldownLengthInSeconds * 1000;
    addClipDelay = config.addClipDelay;
    removeClipTimeInMinutes = config.removeClipTimeInMinutes * 60000;
    updateTimeInMinutes = config.updateTimeInMinutes * 60000

    constructor() {
        this.monitorTwitchChat = new MonitorTwitchChat(
            new TwitchClient(config.joinTimeout),
            {
                requestCount: config.requestCount,
                validMessages: config.validMessages
        });
        this.clipList = new ClipList();
        this.clipper = new Clipper();
    }

    async setupConnection(){
        await this.monitorTwitchChat.updateStreamList();
        await this.monitorTwitchChat.joinChannels();
        await this.monitorTwitchChat.connectToTwitch();
    }

    start(){
        this.startMonitorTimers();
        this.updateTimer = setInterval((function (){this.updateChannels();}).bind(this), this.updateTimeInMinutes);
    }

    async updateChannels(){
        this.endAllMonitorTimers();

        await this.monitorTwitchChat.updateChannels();

        this.startMonitorTimers();
    }

    startMonitorTimers(){
        this.checkTimer = setInterval((function (){this.checkForSpikes(this.spikeValue);}).bind(this), this.spikeTime);
        this.reduceTimer = setInterval((function (){this.monitorTwitchChat.decreaseHits(this.reduceValue)}).bind(this),this.reduceTime)
    }

    endAllMonitorTimers(){
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
                        console.error('\x1b[31m%s\x1b[0m','clipIt :: ' + error);
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

        if (clip.created){
            this.delayAddingClip(clip.data.id);
        }
    }

    async getVideoUrl(slug){
        helper.ensureArgument(slug, 'string');

        return this.clipper.getVideoUrl(slug);
    }

    delayAddingClip(id){
        setTimeout(async function(){
            const videoURL = await this.getVideoUrl(id);
            this.addClip(videoURL);

            setTimeout(function(){
                this.clipList.removeClip();
            }.bind(this), (this.removeClipTimeInMinutes))
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