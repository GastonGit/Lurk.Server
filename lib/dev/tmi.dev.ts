/* istanbul ignore file */

import { Options } from 'tmi.js';

export default class client {
    identity;
    list: string[] = [];
    private msgHandler: any;
    private connectedHandler: any;
    private disconnectedHandler: any;

    constructor(options: Options) {
        this.identity = options.identity;
    }

    on(type: string, func: (err: string | undefined) => Promise<any>): void {
        switch (type) {
            case 'message':
                this.msgHandler = func;
                break;
            case 'connected':
                this.connectedHandler = func;
                break;
            case 'disconnected':
                this.disconnectedHandler = func;
                break;
        }
    }

    getMessageHandler(): any {
        return this.msgHandler;
    }

    connect(): Promise<any> {
        return Promise.resolve(['server', 'port']);
    }

    getIdentity(): any {
        return this.identity;
    }

    join(channel: string): Promise<any> {
        this.list.push(channel);

        return Promise.resolve([channel]);
    }

    part(channel: string): Promise<any> {
        const index = this.list.indexOf(channel);
        this.list = this.list.splice(index, 1);

        return Promise.resolve([channel]);
    }

    joinedChannels(): string[] {
        return this.list;
    }
}
