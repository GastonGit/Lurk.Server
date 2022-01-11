import tmi, { Client, ChatUserstate } from 'tmi.js';
import Logger from './Logger';
import ExtremeTimer from './ExtremeTimer';

export default class TwitchChatInterface {
    private readonly client: Client;

    constructor(username: string, password: string) {
        this.client = new tmi.client({
            connection: {
                secure: true,
                timeout: 71000,
            },
            identity: {
                username: username,
                password: password,
            },
        });
    }

    public async connectToTwitch(channelList: Array<string>): Promise<boolean> {
        this.client.on('connected', () => {
            Logger.success('TMI.JS', 'CONNECTED');
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
        if (channels.length === 0) {
            Logger.info('TwitchChatInterface', 'No channels to join...');
            return true;
        }

        Logger.info('TwitchChatInterface', 'Joining channels...');

        const results = {
            total: channels.length,
            joined: 0,
        };

        const staggerDelay = 800;
        let timeToJoinInSeconds = (results.total * staggerDelay) / 1000;

        for (let i = 0; i < channels.length; i++) {
            this.client
                .join(channels[i])
                .then(() => {
                    results.joined += 1;
                })
                .catch((err) => {
                    Logger.error(
                        'joinChannels',
                        'failed to join: ' + channels[i],
                        err as string,
                    );
                });

            TwitchChatInterface.logTimeRemaining(timeToJoinInSeconds, i);

            await ExtremeTimer.timeOut(staggerDelay);
            timeToJoinInSeconds -= staggerDelay / 1000;
        }

        if (results.joined >= 1) {
            Logger.info(
                'TwitchChatInterface',
                '...Successfully joined ' +
                    results.joined +
                    ' out of ' +
                    results.total +
                    ' channels',
            );
            return true;
        } else {
            Logger.info(
                'TwitchChatInterface',
                '...Could not join any channels',
            );
            return false;
        }
    }

    public async leaveChannels(channels: Array<string>): Promise<boolean> {
        if (channels.length === 0) {
            Logger.info('TwitchChatInterface', 'No channels to leave...');
            return true;
        }

        Logger.info('TwitchChatInterface', 'Leaving channels...');

        const results = {
            total: channels.length,
            left: 0,
        };

        // Command rate limit: 20 per 30 seconds
        const staggerDelay = 1600;
        let timeToLeaveInSeconds = (results.total * staggerDelay) / 1000;

        for (let i = 0; i < channels.length; i++) {
            this.client
                .part(channels[i])
                .then(() => {
                    results.left += 1;
                })
                .catch(() => {
                    results.left += 1;
                    // Will succeed eventually
                    // https://github.com/GastonGit/Lurk.Server/issues/11#issuecomment-1008024713
                });

            TwitchChatInterface.logTimeRemaining(timeToLeaveInSeconds, i);

            await ExtremeTimer.timeOut(staggerDelay);
            timeToLeaveInSeconds -= staggerDelay / 1000;
        }

        if (results.left >= 1) {
            Logger.info(
                'TwitchChatInterface',
                '...Successfully left ' +
                    results.left +
                    ' out of ' +
                    results.total +
                    ' channels',
            );
            return true;
        } else {
            Logger.info(
                'TwitchChatInterface',
                '...Could not leave any channels',
            );
            return false;
        }
    }

    private static logTimeRemaining(time: number, first: number): void {
        if (Math.ceil(time) % 10 === 0 || first == 0) {
            Logger.info(
                'TwitchChatInterface',
                '~' + Math.ceil(time / 10) * 10 + ' seconds remaining...',
            );
        }
    }
}
