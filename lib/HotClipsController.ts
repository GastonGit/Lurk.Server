import { Clip } from './Interfaces';
import ClipList from './ClipList';
import MonitorTwitchChat from './MonitorTwitchChat';
import TwitchClient from './TwitchClient';
import Clipper from './Clipper';
import config from 'config';
import EventIntervals from './EventIntervals';

export default class HotClipsController {
    private clipList: ClipList;
    private clipper: Clipper;
    private monitorTwitchChat: MonitorTwitchChat;
    private eventIntervals: EventIntervals;

    private readonly cooldownLengthInSeconds: number;
    private readonly addClipDelay: number;

    private superInterval;
    private hitCI;
    private reduceCI;
    private removeClipII;

    private readonly spikeValue: number;
    private readonly reduceValue: number;

    constructor() {
        this.clipList = new ClipList();
        this.clipper = new Clipper();
        this.monitorTwitchChat = new MonitorTwitchChat(
            new TwitchClient(
                process.env.BOT_NAME || '',
                process.env.BOT_AUTH || '',
                config.get('joinTimeout'),
            ),
            {
                requestCount: config.get('requestCount'),
                validMessages: config.get('validMessages'),
            },
        );
        this.eventIntervals = new EventIntervals(this.eventSystem.bind(this));

        this.cooldownLengthInSeconds =
            (config.get('cooldownLengthInSeconds') as number) * 1000;
        this.addClipDelay = config.get('addClipDelay');

        this.superInterval = {
            event: 'main',
            timer: (config.get('updateTimeInMinutes') as number) * 60000,
        };
        this.hitCI = {
            event: 'hit',
            timer: config.get('spikeTime') as number,
        };
        this.reduceCI = {
            event: 'reduce',
            timer: config.get('reduceTime') as number,
        };
        this.removeClipII = {
            event: 'remove',
            timer: (config.get('removeClipTimeInMinutes') as number) * 60000,
        };

        this.spikeValue = config.get('spikeValue');
        this.reduceValue = config.get('reduceValue');
    }

    public async start(): Promise<void> {
        const setupSuccess = await this.monitorTwitchChat.setupConnection();

        if (setupSuccess) {
            this.eventIntervals.createConstrainedInterval(
                this.hitCI.event,
                this.hitCI.timer,
            );
            this.eventIntervals.createConstrainedInterval(
                this.reduceCI.event,
                this.reduceCI.timer,
            );

            this.eventIntervals.startIndependentInterval(
                this.removeClipII.event,
                this.removeClipII.timer,
            );

            this.eventIntervals.startSuperInterval(
                this.superInterval.event,
                this.superInterval.timer,
            );
        } else {
            throw Error('Connection setup failed');
        }
    }

    public async eventSystem(event: string): Promise<void> {
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
                        throw Error('clipIT :: UNABLE TO CLIP IT :: ' + err);
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
