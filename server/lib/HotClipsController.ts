let config: {
    spikeValue: any;
    spikeTime: any;
    reduceValue: any;
    reduceTime: any;
    cooldownLengthInSeconds: number;
    addClipDelay: any;
    removeClipTimeInMinutes: number;
    updateTimeInMinutes: number;
    joinTimeout: any;
    requestCount: any;
    validMessages: any;
};

/* istanbul ignore else */
if (process.env.NODE_ENV === 'test') {
    console.log(
        '\x1b[44m%s\x1b[0m',
        '\n--- HotClipsController :: Using settings from configTest.json\n',
    );
    config = require('./settings/configTest.json');
} else {
    console.log(
        '\x1b[44m%s\x1b[0m',
        '\n--- HotClipsController :: Using settings from config.json\n',
    );
    config = require('./settings/config.json');
}

import ClipList from './ClipList';
import MonitorTwitchChat from './MonitorTwitchChat';
import TwitchClient from './TwitchClient';
import Clipper from './Clipper';

export default class HotClipsController {
    clipList: ClipList = new ClipList();
    clipper: Clipper = new Clipper();
    monitorTwitchChat: MonitorTwitchChat = new MonitorTwitchChat(
        new TwitchClient(config.joinTimeout),
        {
            requestCount: config.requestCount,
            validMessages: config.validMessages,
        },
    );
    checkTimer: NodeJS.Timer | undefined;
    reduceTimer: NodeJS.Timer | undefined;
    updateTimer: NodeJS.Timer | undefined;

    spikeValue: number = config.spikeValue;
    spikeTime: number = config.spikeTime;
    reduceValue: number = config.reduceValue;
    reduceTime: number = config.reduceTime;

    cooldownLengthInSeconds: number = config.cooldownLengthInSeconds * 1000;
    addClipDelay: number = config.addClipDelay;
    removeClipTimeInMinutes: number = config.removeClipTimeInMinutes * 60000;
    updateTimeInMinutes: number = config.updateTimeInMinutes * 60000;

    async setupConnection() {
        await this.monitorTwitchChat.updateStreamList();
        await this.monitorTwitchChat.joinChannels();
        await this.monitorTwitchChat.connectToTwitch();
    }

    start() {
        this.startMonitorTimers();
        this.updateTimer = setInterval(() => {
            this.updateChannels();
        }, this.updateTimeInMinutes);
    }

    async updateChannels() {
        this.endAllMonitorTimers();

        await this.monitorTwitchChat.updateChannels();

        this.startMonitorTimers();
    }

    startMonitorTimers() {
        this.checkTimer = setInterval(() => {
            this.checkForSpikes(this.spikeValue);
        }, this.spikeTime);
        this.reduceTimer = setInterval(() => {
            this.monitorTwitchChat.decreaseHits(this.reduceValue);
        }, this.reduceTime);
    }

    endAllMonitorTimers() {
        clearInterval(<NodeJS.Timeout>this.checkTimer);
        clearInterval(<NodeJS.Timeout>this.reduceTimer);
    }

    checkForSpikes(spike: number) {
        const list = [...this.getStreamList()];

        for (let i = 0; i < list.length; i++) {
            if (!list[i].cooldown) {
                if (
                    list[i].hits >=
                    spike + parseInt(list[i].viewer_count) / 5000
                ) {
                    this.clipIt(list[i].user_name).catch((error) => {
                        console.error(
                            '\x1b[31m%s\x1b[0m',
                            'clipIt :: ' + error,
                        );
                    });
                }
            }
        }
    }

    async clipIt(streamer: string) {
        this.cooldownStreamer(streamer);
        this.resetHits(streamer);
        const clip: any = await this.createClip(streamer);

        if (clip.created) {
            this.delayAddingClip(clip.data.id);
        }
    }

    async getVideoUrl(slug: string) {
        return this.clipper.getVideoUrl(slug);
    }

    delayAddingClip(id: any) {
        setTimeout(async () => {
            const videoURL: any = await this.getVideoUrl(id);

            if (videoURL.valid) {
                this.addClip(videoURL.url);
                setTimeout(() => {
                    this.clipList.removeClip();
                }, this.removeClipTimeInMinutes);
            }
        }, this.addClipDelay);
    }

    cooldownStreamer(streamer: string) {
        this.monitorTwitchChat.cooldownStreamer(
            streamer,
            this.cooldownLengthInSeconds,
        );
    }

    getStreamList() {
        return this.monitorTwitchChat.getStreamList();
    }

    addClip(clip: string) {
        this.clipList.addClip(clip);
    }

    async createClip(streamer: string) {
        const broadcasterID = await this.clipper.getBroadcasterID(streamer);
        return this.clipper.createClip(streamer, broadcasterID);
    }

    resetHits(streamer: string) {
        this.monitorTwitchChat.resetStreamer(streamer);
    }

    getList() {
        return this.clipList.getList();
    }
}
