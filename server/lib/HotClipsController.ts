import { Clip } from './Interfaces';
import ClipList from './ClipList';
import MonitorTwitchChat from './MonitorTwitchChat';
import TwitchClient from './TwitchClient';
import Clipper from './Clipper';
import config from './settings/config.json';
import Logger from './Logger';
import Timers from './Timers';

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
    timers: Timers = new Timers(
        this.monitorTwitchChat.updateChannels,
        this.checkForSpikes,
        this.monitorTwitchChat.decreaseHitsByAmount,
    );

    cooldownLengthInSeconds: number = config.cooldownLengthInSeconds * 1000;
    addClipDelay: number = config.addClipDelay;
    removeClipTimeInMinutes: number = config.removeClipTimeInMinutes * 60000;

    public async start(): Promise<void> {
        const setupSuccess = await this.monitorTwitchChat.setupConnection();

        if (setupSuccess) {
            this.timers.startMainTimer();
        } else {
            throw Error('Connection setup failed');
        }
    }

    public getList(): string[] {
        return this.clipList.getList();
    }

    private checkForSpikes(spike: number): void {
        const list = [...this.monitorTwitchChat.getStreamList()];

        for (let i = 0; i < list.length; i++) {
            if (!list[i].cooldown) {
                if (list[i].hits >= spike + list[i].viewer_count / 5000) {
                    this.clipIt(list[i].user_name).catch((err) => {
                        Logger.error('clipIt', 'UNABLE TO CLIP IT', err);
                    });
                }
            }
        }
    }

    private async clipIt(streamer: string): Promise<void> {
        this.monitorTwitchChat.cooldownStreamer(
            streamer,
            this.cooldownLengthInSeconds,
        );
        this.monitorTwitchChat.resetStreamer(streamer);

        const clip: Clip | undefined = await this.clipper.createClip(streamer);

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
}
