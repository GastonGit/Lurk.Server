import { getJSON, getStatus } from './Fetcher';
import { ChatUserstate } from 'tmi.js';

export default class MonitorTwitchChat {
    streamList: Array<any>;
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

    async connectToTwitch() {
        await this.client.connectToTwitch();
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

    async joinChannels() {
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

    updateCompactStreamList() {
        this.compactStreamList = [];
        const compactStreamList = this.compactStreamList;
        this.streamList.forEach(function (streamer) {
            compactStreamList.push(streamer.user_name);
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

    async updateStreamList() {
        this.streamList = await this.requestStreams();
    }

    async requestStreams() {
        const validAAT = await this.validAppAccessToken();

        /* istanbul ignore if */
        if (!validAAT) {
            throw Error('Current App Access Token is invalid');
        }

        // TODO: Temp solution. Add to config.
        const blockedStreamers = ['nymn'];

        const streams: {
            user_name: any;
            viewer_count: number;
            hits: number;
            cooldown: boolean;
        }[] = [];
        let pagination = undefined;

        for (let i = 0; i < this.requestCount; i++) {
            const fetchedStreams: any = await this.request100Streams(
                pagination,
            );

            fetchedStreams.data.forEach(function (streamer: any) {
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

            pagination = fetchedStreams.pagination.cursor;
        }

        return streams;
    }

    async request100Streams(pagination: any) {
        let url = 'https://api.twitch.tv/helix/streams?first=100&language=en';

        if (pagination) {
            url += '&after=' + pagination;
        }

        return await getJSON(url);
    }
}
