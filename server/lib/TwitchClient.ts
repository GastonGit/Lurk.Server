import tmi, { ChatUserstate } from './TMI';
import Logger from './Logger';

export default class TwitchClient {
    private readonly client;
    private joinTimeout;

    constructor(username: string, password: string, joinTimeout: number) {
        this.client = new tmi.client({
            connection: {
                reconnect: true,
                secure: true,
                reconnectInterval: 100000,
                maxReconnectInverval: 120000,
            },
            identity: {
                username: username,
                password: password,
            },
        });
        this.joinTimeout = joinTimeout || 200;
    }

    public async connectToTwitch(channelList: Array<string>): Promise<boolean> {
        this.client.on('connected', () => {
            this.joinChannels(channelList);
        });

        this.client.on('disconnected', (err: string) => {
            Logger.special('TMI.JS', 'DISCONNECTED', err);
            throw Error('UNABLE TO CONNECT');
        });

        return this.client
            .connect()
            .then(() => {
                return true;
            })
            .catch((err: string) => {
                Logger.error('TMI.JS', 'FAILED TO CONNECT', err);
                return false;
            });
    }

    public setMessageHandler(
        messageHandler: (
            channel: string,
            userstate: ChatUserstate,
            message: string,
            self: boolean,
        ) => void,
    ): void {
        this.client.on('message', messageHandler);
    }

    public async joinChannels(channels: Array<string>): Promise<boolean> {
        Logger.info('TwitchClient', 'Joining channels...');
        let success: boolean;

        const client = this.client;
        const promises = channels.map(async (channel) => {
            return await client.join(channel);
        });
        const results = {
            total: channels.length,
            joined: 0,
        };

        const joinResults = await Promise.allSettled(promises);

        if (
            typeof joinResults.find((x) => x.status === 'fulfilled') !==
            'undefined'
        ) {
            results.joined = joinResults.filter(
                (x) => x.status === 'fulfilled',
            ).length;
            Logger.info(
                'TwitchClient',
                '...Successfully joined ' +
                    results.joined +
                    'out of ' +
                    results.total +
                    'channels',
            );
            success = true;
        } else {
            Logger.info('TwitchClient', '...Could not join any channels');
            success = false;
        }

        return success;
    }

    public async leaveChannels(channels: Array<string>): Promise<boolean> {
        Logger.info('TwitchClient', 'Leaving channels...');
        let success = false;

        try {
            const client = this.client;
            const promises = channels.map(async (channel) => {
                return await client.part(channel);
            });

            await Promise.allSettled(promises);

            Logger.info('TwitchClient', '...Left channels');
            success = true;
        } catch (err) {
            Logger.error(
                'TwitchClient',
                'UNABLE TO LEAVE CHANNELS',
                err as string,
            );
        }

        return success;
    }
}
