import { fetch } from './Fetcher';
import { FetchedStreams, fetchResult, Stream, Streams } from './Interfaces';
import TwitchClient from './TwitchClient';
import { ChatUserstate } from 'tmi.js';

export default class MonitorTwitchChat {
    private client: TwitchClient;
    private readonly requestCount: number;
    private readonly validMessages: string[];

    private streamList: Array<Stream> = [];
    private compactStreamList: Array<string> = [];

    constructor(
        client: TwitchClient,
        options: { requestCount: number; validMessages: string[] },
    ) {
        this.client = client;
        this.requestCount = options.requestCount || 1;
        this.validMessages = options.validMessages || ['OMEGALUL'];
        this.client.setMessageHandler(this.onMessageHandler.bind(this));
    }

    public async setupConnection(): Promise<boolean> {
        const updateResult = await this.updateStreamList();
        this.setupConnectedEvent();
        const connectResult = await this.connectToTwitch();

        return updateResult && connectResult;
    }

    private async connectToTwitch(): Promise<boolean> {
        return await this.client.connectToTwitch();
    }

    public async updateChannels(): Promise<boolean> {
        const leaveChannelsSuccess = await this.leaveChannels();
        const updateStreamListSuccess = await this.updateStreamList();
        const joinChannelsSuccess = await this.joinChannels();

        return (
            leaveChannelsSuccess &&
            updateStreamListSuccess &&
            joinChannelsSuccess
        );
    }

    private async leaveChannels(): Promise<boolean> {
        return await this.client.leaveChannels(this.compactStreamList);
    }

    private setupConnectedEvent(): void {
        this.client.client.on('connected', () => {
            this.joinChannels();
        });
    }

    public joinChannels(): Promise<boolean> {
        this.updateCompactStreamList();

        return this.client.joinChannels(this.compactStreamList);
    }

    public decreaseHitsByAmount(amount: number): void {
        this.streamList.forEach(function (streamer: Stream) {
            if (streamer.hits - amount >= 0) {
                streamer.hits = streamer.hits - amount;
            } else {
                streamer.hits = 0;
            }
        });
    }

    private updateCompactStreamList(): void {
        this.compactStreamList = [];

        this.streamList.forEach((streamer: Stream) => {
            this.compactStreamList.push(streamer.user_name);
        });
    }

    private onMessageHandler(
        channel: string,
        _userstate: ChatUserstate,
        message: string,
        _self: boolean,
    ): void {
        if (!this.validMessages.includes(message)) {
            return;
        }

        channel = channel.substring(channel.indexOf('#') + 1);
        this.increaseHitsByOne(channel);
    }

    private increaseHitsByOne(channel: string): void {
        const result = this.getStreamerIndex(channel);

        if (result.success) {
            this.streamList[result.streamerIndex].hits += 1;
        }
    }

    public getStreamList(): Stream[] {
        return this.streamList;
    }

    public cooldownStreamer(channel: string, timeInSeconds: number): void {
        const result = this.getStreamerIndex(channel);

        if (result.success) {
            this.streamList[result.streamerIndex].cooldown = true;
            setTimeout(() => {
                this.removeCooldownForStreamer(channel);
            }, timeInSeconds);
        }
    }

    private removeCooldownForStreamer(channel: string): void {
        const result = this.getStreamerIndex(channel);

        if (result.success) {
            this.streamList[result.streamerIndex].cooldown = false;
        }
    }

    public resetStreamer(channel: string): void {
        const result = this.getStreamerIndex(channel);

        if (result.success) {
            this.streamList[result.streamerIndex].hits = 0;
        }
    }

    private getStreamerIndex(channel: string): {
        success: boolean;
        streamerIndex: number;
    } {
        const streamerFound: Stream | undefined = this.streamList.find(
            (streamer: Stream) => streamer.user_name === channel.toLowerCase(),
        );

        if (typeof streamerFound !== 'undefined') {
            return {
                success: true,
                streamerIndex: this.streamList.indexOf(streamerFound),
            };
        } else {
            return {
                success: false,
                streamerIndex: -1,
            };
        }
    }

    private async updateStreamList(): Promise<boolean> {
        const result = await this.requestStreams();

        this.streamList = result.streams;

        return result.success;
    }

    private async requestStreams(): Promise<Streams> {
        // TODO: Temp solution. Add to config.
        const blockedStreamers = ['nymn'];

        const streams: Array<Stream> = [];
        let pagination = undefined;
        let success = true;

        for (let i = 0; i < this.requestCount; i++) {
            const requestedStreams: fetchResult =
                await MonitorTwitchChat.request100Streams(pagination);
            const fetchedStreams: Array<FetchedStreams> = requestedStreams.data;
            success = requestedStreams.success;

            fetchedStreams.forEach(function (streamer: FetchedStreams) {
                if (
                    !blockedStreamers.includes(
                        streamer.user_login.toLowerCase(),
                    )
                ) {
                    streams.push({
                        user_name: streamer.user_login.toLowerCase(),
                        viewer_count: parseInt(streamer.viewer_count),
                        hits: 0,
                        cooldown: false,
                    });
                }
            });

            pagination = requestedStreams.pagination?.cursor;
        }

        return { success: success, streams: streams };
    }

    private static async request100Streams(
        pagination: string | undefined,
    ): Promise<fetchResult> {
        let url = 'https://api.twitch.tv/helix/streams?first=100&language=en';
        if (pagination) {
            url += '&after=' + pagination;
        }

        const response = await fetch(url);

        return {
            success: response.status === 200,
            data: response.data as Array<FetchedStreams>,
            pagination: response.pagination,
        };
    }
}
