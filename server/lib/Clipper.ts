import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '../.env' });
import fetch, { Response } from 'node-fetch';
import { getResponse, getClip } from './Fetcher';

interface Clip {
    id: string;
    url: string;
    embed_url: string;
    broadcaster_id: string;
    broadcaster_name: string;
    creator_id: string;
    creator_name: string;
    video_id: string;
    game_id: string;
    language: string;
    title: string;
    view_count: number;
    created_at: string;
    thumbnail_url: string;
    duration: number;
}

interface CreateClipResponse {
    created: boolean;
    data: Array<{ id: string; edit_url: string }> | undefined;
}

export default class Clipper {
    public async createClip(
        streamer: string,
        broadcasterID: string,
    ): Promise<Clip | undefined> {
        const response = (await getResponse(
            'https://api.twitch.tv/helix/clips?broadcaster_id=' +
                broadcasterID.toLowerCase(),
        )) as Response;
        const status = response.status;

        if (status === 200 || status === 202) {
            const json: any = await response.json();
            const data = json.data[0];

            console.log(
                '\x1b[32m%s\x1b[0m',
                'createClip :: SUCCESS :: ' + streamer,
            );
            return data;
        } else {
            console.log(
                '\x1b[45m%s\x1b[0m',
                'createClip :: FAILURE :: ' +
                    streamer +
                    ' (status code ' +
                    status +
                    ')',
            );
            return undefined;
        }
    }

    private async getClip(slug: string): Promise<Clip> {
        return await getClip('https://api.twitch.tv/helix/clips?id=' + slug);
    }

    public async getVideoUrl(slug: string): Promise<string | undefined> {
        const clip = await this.getClip(slug);

        if (typeof clip !== 'undefined') {
            return this.formatVideoUrl(clip.thumbnail_url);
        } else {
            return undefined;
        }
    }

    private formatVideoUrl(thumbnail_url: string): string {
        const videoID = thumbnail_url.substring(
            thumbnail_url.indexOf('.tv/') + 4,
            thumbnail_url.indexOf('-preview'),
        );

        return 'https://clips-media-assets2.twitch.tv/' + videoID + '.mp4';
    }

    public async getBroadcasterID(id: string): Promise<string> {
        const user: any = await this.getUser(id);

        return user.data[0].id;
    }

    private async getUser(name: string): Promise<unknown> {
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
                'Client-ID': 'temp',
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
