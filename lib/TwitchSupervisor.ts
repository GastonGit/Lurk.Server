import { FetchedStreams, fetchResult, Stream, Streams } from './Interfaces';
import TwitchChatInterface from './TwitchChatInterface';
import TwitchRequests from './TwitchRequests';
import { ChatUserstate } from 'tmi.js';
import Logger from './Logger';

export default class TwitchSupervisor {
    private client: TwitchChatInterface;
    private readonly requestCount: number;
    private readonly validMessages: string[];

    private streamList: Array<Stream> = [];
    private compactStreamList: Array<string> = [];

    private blockedStreamers: Array<string>;

    constructor(
        username: string,
        password: string,
        options: {
            requestCount: number;
            validMessages: string[];
            blockedStreamers: string[];
        },
    ) {
        this.client = new TwitchChatInterface(username, password);
        this.requestCount = options.requestCount;
        this.validMessages = options.validMessages;
        this.blockedStreamers = options.blockedStreamers;
        this.client.setMessageHandler(this.onMessageHandler.bind(this));
    }

    public async setupConnection(): Promise<boolean> {
        const updateResult = await this.updateLists();
        const connectResult = await this.client.connectToTwitch(
            this.compactStreamList,
        );

        return updateResult && connectResult;
    }

    private removeSecondListValues(
        first: string[],
        second: string[],
    ): string[] {
        return first.filter((x) => !second.includes(x));
    }

    public async updateChannels(): Promise<boolean> {
        const oldList = [...this.compactStreamList];
        const updateListsSuccess = await this.updateLists();
        const newList = [...this.compactStreamList];

        const leaveList = this.removeSecondListValues(
            [...oldList],
            [...newList],
        );
        const joinList = this.removeSecondListValues(
            [...newList],
            [...oldList],
        );

        const leaveChannelsSuccess = await this.client.leaveChannels(leaveList);
        const joinChannelsSuccess = await this.client.joinChannels(joinList);

        return (
            leaveChannelsSuccess && updateListsSuccess && joinChannelsSuccess
        );
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

    public onMessageHandler(
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
        const streamerIndex = this.getStreamerIndex(channel);

        if (streamerIndex !== null) {
            this.streamList[streamerIndex].hits += 1;
        }
    }

    public getStreamList(): Stream[] {
        return this.streamList;
    }

    public cooldownStreamer(channel: string, delay: number): void {
        const streamerIndex = this.getStreamerIndex(channel);

        if (streamerIndex !== null) {
            this.streamList[streamerIndex].cooldown = true;
            setTimeout(() => {
                this.removeCooldownForStreamer(streamerIndex);
            }, delay);
        }
    }

    private removeCooldownForStreamer(index: number): void {
        this.streamList[index].cooldown = false;
    }

    public resetStreamer(channel: string): void {
        const streamerIndex = this.getStreamerIndex(channel);

        if (streamerIndex !== null) {
            this.streamList[streamerIndex].hits = 0;
        }
    }

    private getStreamerIndex(channel: string): number | null {
        const streamerFound = this.streamList.find(
            (streamer: Stream) => streamer.user_name === channel.toLowerCase(),
        );

        if (typeof streamerFound !== 'undefined') {
            return this.streamList.indexOf(streamerFound);
        } else {
            Logger.error(
                'getStreamerIndex',
                'channel: ' + channel,
                'undefined',
            );
            return null;
        }
    }

    public async getVideoUrl(slug: string): Promise<string | null> {
        return await TwitchRequests.getVideoUrl(slug);
    }

    public async createClip(
        streamer: string,
    ): Promise<{ id: string; edit_url: string } | null> {
        return await TwitchRequests.createClip(streamer);
    }

    private async updateLists(): Promise<boolean> {
        const updateStreamListResult = await this.updateStreamList();
        this.updateCompactStreamList();

        return updateStreamListResult;
    }

    private updateCompactStreamList(): void {
        this.compactStreamList = [];
        this.streamList.forEach((streamer: Stream) => {
            this.compactStreamList.push(streamer.user_name);
        });
    }

    private async updateStreamList(): Promise<boolean> {
        const result = await this.requestStreams();

        this.streamList = result.streams;

        return result.success;
    }

    private removeBlockedStreamers(list: FetchedStreams[]) {
        return list.filter(
            (x) => !this.blockedStreamers.includes(x.user_login.toLowerCase()),
        );
    }

    private async requestStreams(): Promise<Streams> {
        const streams: Array<Stream> = [];
        let pagination = undefined;
        let success = true;

        for (let i = 0; i < this.requestCount; i++) {
            const requestedStreams: fetchResult =
                await TwitchRequests.request100Streams(pagination);
            const fetchedStreams: Array<FetchedStreams> = requestedStreams.data;
            success = requestedStreams.success;

            const streamList = this.removeBlockedStreamers(fetchedStreams);

            if (success) {
                streamList.forEach((streamer: FetchedStreams) => {
                    streams.push({
                        user_name: streamer.user_login.toLowerCase(),
                        viewer_count: streamer.viewer_count,
                        hits: 0,
                        cooldown: false,
                    });
                });

                pagination = requestedStreams.pagination?.cursor;
            } else {
                return { success: success, streams: streams };
            }
        }

        return { success: success, streams: streams };
    }
}
