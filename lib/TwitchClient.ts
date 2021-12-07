import tmi, { ChatUserstate } from './TMI';
import Logger from './Logger';
import ExtremeTimer from './ExtremeTimer';

export default class TwitchClient {
    private readonly client: import('tmi.js').Client;
    private joinTimeout: number;

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
            Logger.success('TMI', 'CONNECTED');
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

        const results = {
            total: channels.length,
            joined: 0,
        };

        const staggerAmount = 10;
        const staggerDelay = 10000;

        for (let i = 0; i < channels.length; i++) {
            await this.client
                .join(channels[i])
                .then(() => {
                    results.joined += 1;
                })
                .catch((err) => {
                    Logger.failure(
                        'joinChannels',
                        'failed to join: ' + channels[i],
                        err as string,
                    );
                });

            if (i % staggerAmount === 0 && i !== 0) {
                Logger.info(
                    'TwitchClient',
                    '~' + (channels.length - i + 1) + ' seconds remaining...',
                );
                await ExtremeTimer.timeOut(staggerDelay);
            }
        }

        if (results.joined >= 1) {
            Logger.info(
                'TwitchClient',
                '...Successfully joined ' +
                    results.joined +
                    ' out of ' +
                    results.total +
                    ' channels',
            );
            return true;
        } else {
            Logger.info('TwitchClient', '...Could not join any channels');
            return false;
        }
    }

    public async leaveChannels(channels: Array<string>): Promise<boolean> {
        Logger.info('TwitchClient', 'Leaving channels...');

        const client = this.client;
        const promises = channels.map(async (channel) => {
            return await client.part(channel);
        });

        const results = {
            total: channels.length,
            left: 0,
        };

        const joinResults = await Promise.allSettled(promises);

        if (
            typeof joinResults.find((x) => x.status === 'fulfilled') !==
            'undefined'
        ) {
            results.left = joinResults.filter(
                (x) => x.status === 'fulfilled',
            ).length;
            Logger.info(
                'TwitchClient',
                '...Successfully left ' +
                    results.left +
                    'out of ' +
                    results.total +
                    'channels',
            );
            return true;
        } else {
            Logger.info('TwitchClient', '...Could not leave any channels');
            return false;
        }
    }
}