import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '../.env' });
import fetch, { Response } from 'node-fetch';
import { getResponse, fetch as fetcherFetch } from './Fetcher';
import { User } from './Interfaces';

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

    private static async getClip(slug: string): Promise<Clip | undefined> {
        const fetchResult = await fetcherFetch(
            'https://api.twitch.tv/helix/clips?id=' + slug,
        );

        return fetchResult.data?.shift();
    }

    public async getVideoUrl(slug: string): Promise<string | undefined> {
        const clip = await Clipper.getClip(slug);

        if (typeof clip !== 'undefined') {
            return Clipper.formatVideoUrl(clip.thumbnail_url);
        } else {
            return undefined;
        }
    }

    private static formatVideoUrl(thumbnail_url: string): string {
        const videoID = thumbnail_url.substring(
            thumbnail_url.indexOf('.tv/') + 4,
            thumbnail_url.indexOf('-preview'),
        );

        return 'https://clips-media-assets2.twitch.tv/' + videoID + '.mp4';
    }

    public async getBroadcasterID(id: string): Promise<string | undefined> {
        const user: User | undefined = await Clipper.getUser(id);

        return user?.id;
    }

    /*
        TODO: MIGHT NEED UPDATED/SPECIAL ACCESS TOKEN DURING FETCHING
     */
    private static async getUser(name: string): Promise<User | undefined> {
        const url =
            'https://api.twitch.tv/helix/users?' +
            'login=' +
            name.toLowerCase();

        const fetchResult = await fetcherFetch(url);

        if (fetchResult.status === 200) {
            return fetchResult.data?.shift();
        } else {
            return undefined;
        }
    }
}
