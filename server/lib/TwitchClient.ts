import tmi from './dev/tmiDev';
import { ChatUserstate } from 'tmi.js';

export default class TwitchClient {
    client;
    joinTimeout;

    constructor(joinTimeout: number) {
        this.client = new tmi.client({
            connection: {
                reconnect: true,
                secure: true,
                reconnectInterval: 100000,
                maxReconnectInverval: 120000,
            },
            identity: {
                username: process.env.BOT_NAME,
                password: process.env.BOT_AUTH,
            },
        });
        this.joinTimeout = joinTimeout || 200;
    }

    public async connectToTwitch(): Promise<boolean> {
        /* istanbul ignore next */
        this.client.on('disconnected', (reason: string) => {
            console.error(
                '\x1b[45m%s\x1b[0m',
                'TMI.JS :: DISCONNECT :: ' + reason,
            );
            throw Error('UNABLE TO CONNECT');
        });

        return this.client
            .connect()
            .then(() => {
                return true;
            })
            .catch((err: string) => {
                console.log('Error connecting to Twitch: ' + err);
                return false;
            });
    }

    setMessageHandler(
        messageHandler: (
            channel: string,
            userstate: ChatUserstate,
            message: string,
            self: boolean,
        ) => void,
    ) {
        this.client.on('message', messageHandler);
    }

    async joinChannels(channels: Array<any>): Promise<boolean> {
        console.log(
            '\x1b[44m%s\x1b[0m',
            '\n--- TwitchClient :: Joining channels...',
        );

        const client = this.client;
        const promises = channels.map(async (channel) => {
            return await client.join(channel);
        });

        const result = await Promise.allSettled(promises);
        console.log(result.map((promise) => promise.status));

        console.log(
            '\x1b[44m%s\x1b[0m',
            '\n--- TwitchClient :: ...Joined channels',
        );
    }

    async leaveChannels(channels: Array<any>): Promise<boolean> {
        console.log(
            '\x1b[44m%s\x1b[0m',
            '\n--- TwitchClient :: Leaving channels...',
        );

        const client = this.client;
        const promises = channels.map(async (channel) => {
            return await client.part(channel);
        });

        const result = await Promise.allSettled(promises);
        console.log(result.map((promise) => promise.status));

        console.log(
            '\x1b[44m%s\x1b[0m',
            '--- TwitchClient :: ...Left channels',
        );
    }
}
