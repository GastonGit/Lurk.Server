import { getJSON, getStatus, fetch } from './Fetcher';
import { response } from 'express';

interface Stream {
    user_name: string;
    viewer_count: number;
    hits: number;
    cooldown: boolean;
}

interface FetchedStreams {
    user_login: string;
    viewer_count: string;
}

interface Streams {
    success: boolean;
    streams: Array<Stream>;
}

interface fetchResult {
    success: boolean;
    data: Array<FetchedStreams>;
    pagination: { cursor: string } | undefined;
}

export default class MonitorTwitchChat {
    streamList: Array<Stream>;
    requestCount;
    validMessages;
    client;
    compactStreamList: Array<string>;

    constructor(client: any, options: any) {
        this.requestCount = options.requestCount || 1;
        this.streamList = [];
        this.validMessages = options.validMessages || ['OMEGALUL'];
        this.compactStreamList = [];
        this.client = client;
        this.client.setMessageHandler(this.onMessageHandler.bind(this));
    }

    async connectToTwitch(): Promise<boolean> {
        return await this.client.connectToTwitch();
    }

    async updateChannels() {
        await this.leaveChannels();

        await this.updateStreamList();
        this.updateCompactStreamList();
        await this.client.joinChannels(this.getCompactStreamList());
    }

    async leaveChannels() {
        await this.client.leaveChannels(this.getCompactStreamList());
    }

    public joinChannels(): void {
        this.updateCompactStreamList();

        this.client.client.on('connected', () => {
            this.client.joinChannels(this.getCompactStreamList());
        });
    }

    decreaseHits(amount: number) {
        this.streamList.forEach(function (streamer) {
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

    getCompactStreamList() {
        return this.compactStreamList;
    }

    onMessageHandler(channel: string, message: string) {
        if (!this.validMessages.includes(message)) {
            return;
        }

        channel = channel.substring(channel.indexOf('#') + 1);

        this.streamList[this.getStreamerIndex(channel)].hits += 1;
    }

    getStreamList() {
        return this.streamList;
    }

    cooldownStreamer(streamer: string, timeInSeconds: number) {
        const index = this.getStreamerIndex(streamer);

        if (typeof this.streamList[index] !== 'undefined') {
            this.streamList[index].cooldown = true;
            setTimeout(() => {
                this.removeCooldownForStreamer(streamer);
            }, timeInSeconds);
        }
    }

    removeCooldownForStreamer(streamer: string) {
        const index = this.getStreamerIndex(streamer);

        if (typeof this.streamList[index] !== 'undefined') {
            this.streamList[index].cooldown = false;
        }
    }

    async validAppAccessToken() {
        const status = await getStatus(
            'https://api.twitch.tv/helix/users?id=141981764',
        );

        return status !== 401;
    }

    resetStreamer(channel: any) {
        this.streamList[this.getStreamerIndex(channel)].hits = 0;
    }

    resetAllStreamers() {
        this.streamList.forEach(function (streamer) {
            streamer.hits = 0;
        });
    }

    getStreamerIndex(channel: any) {
        const userObject = this.streamList.find(
            (streamer) => streamer.user_name === channel.toLowerCase(),
        );
        return this.streamList.indexOf(userObject);
    }

    public async updateStreamList(): Promise<boolean> {
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
