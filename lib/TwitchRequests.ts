import { Clip, fetchResult, User } from './Interfaces';
import Fetcher from './Fetcher';

export default class TwitchRequests {
    public static async request100Streams(
        pagination: string | undefined,
    ): Promise<fetchResult> {
        let url = 'https://api.twitch.tv/helix/streams?first=100&language=en';
        if (typeof pagination !== 'undefined') {
            url += '&after=' + pagination;
        }

        const response = await Fetcher.fetch(url);

        return {
            success: response.status === 200,
            data: response.data,
            pagination: response.pagination,
        };
    }

    /*
        TODO: MIGHT NEED UPDATED/SPECIAL ACCESS TOKEN DURING FETCHING
     */
    public static async getUser(name: string): Promise<User | undefined> {
        const url =
            'https://api.twitch.tv/helix/users?' +
            'login=' +
            name.toLowerCase();

        const fetchResult = await Fetcher.fetch(url);

        if (fetchResult.status === 200) {
            return fetchResult.data?.shift();
        } else {
            return undefined;
        }
    }

    public static async getClip(slug: string): Promise<Clip | undefined> {
        const fetchResult = await Fetcher.fetch(
            'https://api.twitch.tv/helix/clips?id=' + slug,
        );

        return fetchResult.data?.shift();
    }

    public static async getVideoUrl(slug: string): Promise<string | undefined> {
        const clip = await TwitchRequests.getClip(slug);

        if (typeof clip !== 'undefined') {
            return TwitchRequests.formatVideoUrl(clip.thumbnail_url);
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
}
