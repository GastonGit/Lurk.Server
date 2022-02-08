import ClipList from './ClipList';
import Container from './Container';
import TwitchSupervisor from './TwitchSupervisor';
import config from 'config';
import EventIntervals from './EventIntervals';
import { Stream } from './Interfaces';

export default class HotClipsController {
    private clipList: ClipList;
    private container: Container;
    private twitchSupervisor: TwitchSupervisor;
    private eventIntervals: EventIntervals;

    private readonly cooldownLength: number;
    private readonly addClipDelay: number;

    private readonly spikeValue: number;
    private readonly reduceValue: number;

    constructor() {
        this.clipList = new ClipList();
        this.container = new Container(config.get('list'));
        this.eventIntervals = new EventIntervals();
        this.twitchSupervisor = new TwitchSupervisor(
            process.env.BOT_NAME || '',
            process.env.BOT_AUTH || '',
            {
                requestCount: config.get('requestCount'),
                validMessages: config.get('validMessages'),
                blockedStreamers: config.get('blockedStreamers'),
            },
        );

        this.cooldownLength =
            (config.get('cooldownLengthInSeconds') as number) * 1000;
        this.addClipDelay = parseInt(config.get('addClipDelay'));

        this.spikeValue = config.get('spikeValue');
        this.reduceValue = config.get('reduceValue');
    }

    public async start(): Promise<void> {
        const setupSuccess = await this.twitchSupervisor.setupConnection();

        if (setupSuccess) {
            const latestList = await this.container.getList();
            this.clipList.setList(latestList);

            this.eventIntervals.createConstrainedInterval(() => {
                this.checkForSpikes(this.spikeValue);
            }, parseInt(config.get('spikeTime')));
            this.eventIntervals.createConstrainedInterval(() => {
                this.twitchSupervisor.decreaseHitsByAmount(this.reduceValue);
            }, parseInt(config.get('reduceTime')));

            this.eventIntervals.startIndependentInterval(
                'removeClip',
                () => {
                    if (
                        this.clipList.getList().length >
                        parseInt(config.get('maxClipCount'))
                    ) {
                        this.clipList.removeClip();
                    }
                },
                parseInt(config.get('removeClipTimeInMinutes')) * 60000,
            );
            this.eventIntervals.startIndependentInterval(
                'updateList',
                async () => {
                    await this.container.updateList(this.clipList.getList());
                },
                parseInt(config.get('updateListTimeInMinutes')) * 60000,
            );

            this.eventIntervals.startSuperInterval(async () => {
                await this.twitchSupervisor.updateChannels();
            }, parseInt(config.get('updateTimeInMinutes')) * 60000);
        } else {
            throw Error('Connection setup failed');
        }
    }

    public getList(): string[] {
        return this.clipList.getList();
    }

    private checkForSpikes(spike: number): void {
        const list = [...this.twitchSupervisor.getStreamList()];

        for (let i = 0; i < list.length; i++) {
            if (
                !list[i].cooldown &&
                HotClipsController.spikeFound(list[i], spike)
            ) {
                this.clipIt(list[i].user_name).catch((err) => {
                    throw Error('clipIT :: UNABLE TO CLIP IT :: ' + err);
                });
            }
        }
    }

    private static spikeFound(streamer: Stream, spike: number): boolean {
        return streamer.hits >= spike + streamer.viewer_count / 5000;
    }

    private async clipIt(streamer: string): Promise<void> {
        this.twitchSupervisor.cooldownStreamer(streamer, this.cooldownLength);
        this.twitchSupervisor.resetStreamer(streamer);

        const clip = await this.twitchSupervisor.createClip(streamer);

        if (clip !== null) {
            this.addClipWithDelay(clip.id);
        }
    }

    private addClipWithDelay(slug: string): void {
        setTimeout(async () => {
            const url = await this.twitchSupervisor.getVideoUrl(slug);

            if (url !== null) {
                this.clipList.addClip(url);
            }
        }, this.addClipDelay);
    }
}
