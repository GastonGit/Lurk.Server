import { Clip, fetchResult, User } from './Interfaces';
import Fetcher from './Fetcher';
import Logger from './Logger';

export default class TwitchRequests {
    public static async createClip(
        streamer: string,
    ): Promise<{ id: string; edit_url: string } | null> {
        const user = await TwitchRequests.getUser(streamer);
        const userID = user?.id;

        if (typeof userID !== 'undefined') {
            const fetchResponse = await Fetcher.fetch(
                'https://api.twitch.tv/helix/clips?broadcaster_id=' +
                    userID.toLowerCase(),
                'post',
            );

            if (fetchResponse.ok && typeof fetchResponse.data !== 'undefined') {
                Logger.success('createClip', streamer);
                return fetchResponse.data[0];
            } else {
                Logger.failure(
                    'createClip',
                    streamer,
                    'fetch was unsuccessful',
                );
                return null;
            }
        } else {
            return null;
        }
    }

    public static async request100Streams(
        pagination: string | undefined,
    ): Promise<fetchResult> {
        let url = 'https://api.twitch.tv/helix/streams?first=100&language=en';
        if (typeof pagination !== 'undefined') {
            url += '&after=' + pagination;
        }

        const response = await Fetcher.fetch(url, 'get');

        return {
            success: response.ok,
            data: response.data,
            pagination: response.pagination,
        };
    }

    /*
        TODO: MIGHT NEED UPDATED/SPECIAL ACCESS TOKEN DURING FETCHING
     */
    public static async getUser(name: string): Promise<User | null> {
        const url =
            'https://api.twitch.tv/helix/users?' +
            'login=' +
            name.toLowerCase();

        const fetchResult = await Fetcher.fetch(url, 'get');

        if (fetchResult.ok) {
            return fetchResult.data?.shift();
        } else {
            return null;
        }
    }

    public static async getClip(slug: string): Promise<Clip | null> {
        const fetchResult = await Fetcher.fetch(
            'https://api.twitch.tv/helix/clips?id=' + slug,
            'get',
        );

        return fetchResult.data?.shift() || null;
    }

    public static async getVideoUrl(slug: string): Promise<string | null> {
        const clip = await TwitchRequests.getClip(slug);

        if (clip !== null) {
            return TwitchRequests.formatVideoUrl(clip.thumbnail_url);
        } else {
            return null;
        }
    }

    private static formatVideoUrl(thumbnail_url: string): string {
        const videoID = thumbnail_url.substring(
            thumbnail_url.indexOf('.tv/') + 4,
            thumbnail_url.indexOf('-preview'),
        );

        return 'https://clips-media-assets2.twitch.tv/' + videoID + '.mp4';
    }
}
