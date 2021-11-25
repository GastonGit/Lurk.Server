import { Stream } from './Interfaces';

let config: {
    spikeValue: number;
    spikeTime: number;
    reduceValue: number;
    reduceTime: number;
    cooldownLengthInSeconds: number;
    addClipDelay: number;
    removeClipTimeInMinutes: number;
    updateTimeInMinutes: number;
    joinTimeout: number;
    requestCount: number;
    validMessages: string[];
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

    public async start(): Promise<void> {
        const setupSuccess = await this.setupConnection();

        if (setupSuccess) {
            this.startTimers();
        } else {
            throw Error('Connection setup failed');
        }
    }

    public getList(): string[] {
        return this.clipList.getList();
    }

    private async setupConnection(): Promise<boolean> {
        const updateResult = await this.monitorTwitchChat.updateStreamList();
        this.monitorTwitchChat.joinChannels();
        const connectResult = await this.monitorTwitchChat.connectToTwitch();

        return updateResult && connectResult;
    }

    private startTimers(): void {
        this.startMonitorTimers();
        this.updateTimer = setInterval(() => {
            this.updateChannels();
        }, this.updateTimeInMinutes);
    }

    private async updateChannels(): Promise<void> {
        this.endAllMonitorTimers();

        await this.monitorTwitchChat.updateChannels();

        this.startMonitorTimers();
    }

    private startMonitorTimers(): void {
        this.checkTimer = setInterval(() => {
            this.checkForSpikes(this.spikeValue);
        }, this.spikeTime);
        this.reduceTimer = setInterval(() => {
            this.monitorTwitchChat.decreaseHitsByAmount(this.reduceValue);
        }, this.reduceTime);
    }

    private endAllMonitorTimers(): void {
        clearInterval(<NodeJS.Timeout>this.checkTimer);
        clearInterval(<NodeJS.Timeout>this.reduceTimer);
    }

    private checkForSpikes(spike: number): void {
        const list = [...this.getStreamList()];

        for (let i = 0; i < list.length; i++) {
            if (!list[i].cooldown) {
                if (list[i].hits >= spike + list[i].viewer_count / 5000) {
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

    private async clipIt(streamer: string): Promise<void> {
        this.cooldownStreamer(streamer);
        this.resetHits(streamer);
        const clip: any = await this.createClip(streamer);

        if (clip.created) {
            this.delayAddingClip(clip.data.id);
        }
    }

    private async getVideoUrl(slug: string): Promise<string> {
        return (await this.clipper.getVideoUrl(slug)) as string;
    }

    private delayAddingClip(id: any): void {
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

    private cooldownStreamer(streamer: string): void {
        this.monitorTwitchChat.cooldownStreamer(
            streamer,
            this.cooldownLengthInSeconds,
        );
    }

    private getStreamList(): Stream[] {
        return this.monitorTwitchChat.getStreamList();
    }

    private addClip(clip: string): void {
        this.clipList.addClip(clip);
    }

    private async createClip(streamer: string) {
        const broadcasterID = await this.clipper.getBroadcasterID(streamer);
        return this.clipper.createClip(streamer, broadcasterID);
    }

    private resetHits(streamer: string): void {
        this.monitorTwitchChat.resetStreamer(streamer);
    }
}
