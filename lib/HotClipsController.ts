import { Clip } from './Interfaces';
import ClipList from './ClipList';
import TwitchSupervisor from './TwitchSupervisor';
import Clipper from './Clipper';
import config from 'config';
import EventIntervals from './EventIntervals';

export default class HotClipsController {
    private clipList: ClipList;
    private clipper: Clipper;
    private monitorTwitchChat: TwitchSupervisor;
    private eventIntervals: EventIntervals;

    private readonly cooldownLengthInSeconds: number;
    private readonly addClipDelay: number;

    private readonly spikeValue: number;
    private readonly reduceValue: number;

    constructor() {
        this.clipList = new ClipList();
        this.clipper = new Clipper();
        this.eventIntervals = new EventIntervals();
        this.monitorTwitchChat = new TwitchSupervisor(
            process.env.BOT_NAME || '',
            process.env.BOT_AUTH || '',
            config.get('joinTimeout'),
            {
                requestCount: config.get('requestCount'),
                validMessages: config.get('validMessages'),
            },
        );

        this.cooldownLengthInSeconds =
            (config.get('cooldownLengthInSeconds') as number) * 1000;
        this.addClipDelay = parseInt(config.get('addClipDelay'));

        this.spikeValue = config.get('spikeValue');
        this.reduceValue = config.get('reduceValue');
    }

    public async start(): Promise<void> {
        const setupSuccess = await this.monitorTwitchChat.setupConnection();

        if (setupSuccess) {
            this.eventIntervals.createConstrainedInterval(() => {
                this.checkForSpikes(this.spikeValue);
            }, parseInt(config.get('spikeTime')));
            this.eventIntervals.createConstrainedInterval(() => {
                this.monitorTwitchChat.decreaseHitsByAmount(this.reduceValue);
            }, parseInt(config.get('reduceTime')));

            this.eventIntervals.startIndependentInterval(
                'removeClip',
                () => {
                    if (this.clipList.getList().length > 20) {
                        this.clipList.removeClip();
                    }
                },
                parseInt(config.get('removeClipTimeInMinutes')) * 60000,
            );

            this.eventIntervals.startSuperInterval(async () => {
                await this.monitorTwitchChat.updateChannels;
            }, parseInt(config.get('updateTimeInMinutes')) * 60000);
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
