import { Clip } from './Interfaces';
import ClipList from './ClipList';
import MonitorTwitchChat from './MonitorTwitchChat';
import TwitchClient from './TwitchClient';
import Clipper from './Clipper';
import config from './settings/config.json';

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
        this.monitorTwitchChat.setupConnectedEvent();
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
        const list = [...this.monitorTwitchChat.getStreamList()];

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
        this.monitorTwitchChat.resetStreamer(streamer);

        const clip = await this.clipper.createClip(streamer);

        if (typeof clip !== 'undefined') {
            this.addClipWithDelay(clip.id);
        }
    }

    private addClipWithDelay(slug: string): void {
        setTimeout(async () => {
            const url = await this.clipper.getVideoUrl(slug);

            if (typeof url !== 'undefined') {
                this.clipList.addClip(url);
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
}
