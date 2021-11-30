import { Clip } from './Interfaces';
import ClipList from './ClipList';
import MonitorTwitchChat from './MonitorTwitchChat';
import TwitchClient from './TwitchClient';
import Clipper from './Clipper';
import config from './settings/config.json';
import Logger from './Logger';
import EventIntervals from './EventIntervals';

export default class HotClipsController {
    clipList: ClipList = new ClipList();
    clipper: Clipper = new Clipper();
    monitorTwitchChat: MonitorTwitchChat = new MonitorTwitchChat(
        new TwitchClient(
            process.env.BOT_NAME || '',
            process.env.BOT_AUTH || '',
            config.joinTimeout,
        ),
        {
            requestCount: config.requestCount,
            validMessages: config.validMessages,
        },
    );
    timers: EventIntervals = new EventIntervals(this.eventSystem.bind(this));

    cooldownLengthInSeconds: number = config.cooldownLengthInSeconds * 1000;
    addClipDelay: number = config.addClipDelay;
    removeClipTimeInMinutes: number = config.removeClipTimeInMinutes * 60000;

    private superInterval = {
        event: 'main',
        timer: config.updateTimeInMinutes * 60000,
    };
    private hitCI = {
        event: 'hit',
        timer: config.spikeTime,
    };
    private reduceCI = {
        event: 'reduce',
        timer: config.reduceTime,
    };
    private removeClipII = {
        event: 'remove',
        timer: config.removeClipTimeInMinutes * 60000,
    };

    private spikeValue: number = config.spikeValue;
    private reduceValue: number = config.reduceValue;

    public async start(): Promise<void> {
        const setupSuccess = await this.monitorTwitchChat.setupConnection();

        if (setupSuccess) {
            this.startIntervals();
        } else {
            throw Error('Connection setup failed');
        }
    }

    private startIntervals(): void {
        this.timers.createConstrainedInterval(
            this.hitCI.event,
            this.hitCI.timer,
        );
        this.timers.createConstrainedInterval(
            this.reduceCI.event,
            this.reduceCI.timer,
        );

        this.timers.startIndependentInterval(
            this.removeClipII.event,
            this.removeClipII.timer,
        );

        this.timers.startSuperInterval(
            this.superInterval.event,
            this.superInterval.timer,
        );
    }

    private async eventSystem(event: string) {
        switch (event) {
            case this.superInterval.event:
                await this.monitorTwitchChat.updateChannels();
                return;
            case this.hitCI.event:
                this.checkForSpikes(this.spikeValue);
                break;
            case this.reduceCI.event:
                this.monitorTwitchChat.decreaseHitsByAmount(this.reduceValue);
                break;
            case this.removeClipII.event:
                if (this.clipList.getList().length > 20) {
                    this.clipList.removeClip();
                }
                break;
            default:
                throw Error('eventSystem - Unknown case: ' + event);
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
            }
        }, this.addClipDelay);
    }
}
