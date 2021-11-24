import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '../.env' });
import fetch, { Response } from 'node-fetch';
import { getResponse } from './Fetcher';

interface Credentials {
    id: string;
    secret: string;
    code: string;
    refresh: string;
}

interface CreateClipResponse {
    created: boolean;
    data: Array<{ id: string; edit_url: string }> | undefined;
}

export default class Clipper {
    private credentials: Credentials;

    constructor(id: string, secret: string, code: string, refresh: string) {
        this.credentials = {
            id: id,
            secret: secret,
            code: code,
            refresh: refresh,
        };
    }

    async createClip(streamer: string): Promise<CreateClipResponse> {
        const broadcasterID: string = await this.getBroadcasterID(streamer);

        const url: string =
            'https://api.twitch.tv/helix/clips?broadcaster_id=' +
            broadcasterID.toLowerCase();

        const response = (await getResponse(url)) as Response;

        const status = response.status;

        if (status === 200 || status === 202) {
            const json: any = await response.json();
            const data = json.data[0];

            console.log(
                '\x1b[32m%s\x1b[0m',
                'createClip :: SUCCESS :: ' + streamer,
            );
            return { created: true, data };
        } else {
            console.log(
                '\x1b[45m%s\x1b[0m',
                'createClip :: FAILURE :: ' +
                    streamer +
                    ' (status code ' +
                    status +
                    ')',
            );
            return { created: false, data: undefined };
        }
    }

    async getClip(slug: string): Promise<any> {
        if (process.env.NODE_ENV === 'development') {
            return {
                thumbnail_url:
                    'https://clips-media-assets2.twitch.tv/AT-cm%7C1140679825-preview-480x272.jpg',
            };
        }

        const url = 'https://api.twitch.tv/helix/clips?id=' + slug;
        //const accessToken = await this.getAccessToken();
        const accessToken = 'temp';

        const response = await fetch(url, {
            method: 'get',
            headers: {
                'Client-ID': this.credentials.id,
                Authorization: 'Bearer ' + accessToken,
            },
        });

        const result: any = await response.json();

        return result.data[0];
    }

    async getVideoUrl(slug: string): Promise<unknown> {
        const clip = await this.getClip(slug);

        if (typeof clip !== 'undefined') {
            const url = this.formatVideoUrl(clip.thumbnail_url);

            return { valid: true, url };
        } else {
            return { valid: false };
        }
    }

    formatVideoUrl(thumbnail_url: string): string {
        const videoID = thumbnail_url.substring(
            thumbnail_url.indexOf('.tv/') + 4,
            thumbnail_url.indexOf('-preview'),
        );

        return 'https://clips-media-assets2.twitch.tv/' + videoID + '.mp4';
    }

    async getBroadcasterID(id: string): Promise<string> {
        const user: any = await this.getUser(id);

        return user.data[0].id;
    }

    async getUser(name: string): Promise<unknown> {
        if (process.env.NODE_ENV === 'development') {
            return { data: ['shit'] };
        }

        const url =
            'https://api.twitch.tv/helix/users?' +
            'login=' +
            name.toLowerCase();
        //const accessToken = await this.getAccessToken();
        const accessToken = 'temp';

        const response = await fetch(url, {
            method: 'get',
            headers: {
                'Client-ID': this.credentials.id,
                Authorization: 'Bearer ' + accessToken,
            },
        });

        const status = await response.status;

        if (status !== 200) {
            throw new Error('getUser - status code is: ' + status);
        }

        return await response.json();
    }
}
