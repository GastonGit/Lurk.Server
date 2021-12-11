import { FetchedStreams, fetchResult, Stream, Streams } from './Interfaces';
import TwitchChatInterface from './TwitchChatInterface';
import TwitchRequests from './TwitchRequests';
import { ChatUserstate } from 'tmi.js';

export default class TwitchSupervisor {
    private client: TwitchChatInterface;
    private readonly requestCount: number;
    private readonly validMessages: string[];

    private streamList: Array<Stream> = [];
    private compactStreamList: Array<string> = [];

    constructor(
        username: string,
        password: string,
        joinTimeout: number,
        options: { requestCount: number; validMessages: string[] },
    ) {
        this.client = new TwitchChatInterface(username, password, joinTimeout);
        this.requestCount = options.requestCount;
        this.validMessages = options.validMessages;
        this.client.setMessageHandler(this.onMessageHandler.bind(this));
    }

    public async setupConnection(): Promise<boolean> {
        const updateResult = await this.updateLists();
        const connectResult = await this.client.connectToTwitch(
            this.compactStreamList,
        );

        return updateResult && connectResult;
    }

    public async updateChannels(): Promise<boolean> {
        const leaveChannelsSuccess = await this.client.leaveChannels(
            this.compactStreamList,
        );
        const updateListsSuccess = await this.updateLists();
        const joinChannelsSuccess = await this.client.joinChannels(
            this.compactStreamList,
        );

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
        const result = this.getStreamerIndex(channel);

        /* istanbul ignore else */
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

        /* istanbul ignore else */
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

    private async requestStreams(): Promise<Streams> {
        // TODO: Temp solution. Add to config.
        const blockedStreamers = ['nymn'];

        const streams: Array<Stream> = [];
        let pagination = undefined;
        let success = true;

        for (let i = 0; i < this.requestCount; i++) {
            const requestedStreams: fetchResult =
                await TwitchRequests.request100Streams(pagination);
            const fetchedStreams: Array<FetchedStreams> = requestedStreams.data;
            success = requestedStreams.success;

            if (success) {
                fetchedStreams.forEach(function (streamer: FetchedStreams) {
                    /* istanbul ignore else */
                    if (
                        !blockedStreamers.includes(
                            streamer.user_login.toLowerCase(),
                        )
                    ) {
                        streams.push({
                            user_name: streamer.user_login.toLowerCase(),
                            viewer_count: streamer.viewer_count,
                            hits: 0,
                            cooldown: false,
                        });
                    }
                });

                pagination = requestedStreams.pagination?.cursor;
            } else {
                return { success: success, streams: streams };
            }
        }

        return { success: success, streams: streams };
    }
}
