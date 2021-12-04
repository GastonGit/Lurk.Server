import Fetcher from './Fetcher';
import { User, Clip } from './Interfaces';
import Logger from './Logger';

export default class Clipper {
    public async createClip(streamer: string): Promise<Clip | undefined> {
        const user = await Clipper.getUser(streamer);
        const userID = user?.id;

        if (typeof userID !== 'undefined') {
            const fetchResponse = await Fetcher.fetch(
                'https://api.twitch.tv/helix/clips?broadcaster_id=' +
                    userID.toLowerCase(),
            );

            if (
                (fetchResponse.status === 200 ||
                    fetchResponse.status === 202) &&
                typeof fetchResponse.data !== 'undefined'
            ) {
                Logger.success('createClip', streamer);
                return fetchResponse.data[0];
            } else {
                Logger.failure(
                    'createClip',
                    streamer,
                    'StatusCode=' + fetchResponse.status,
                );
                return undefined;
            }
        } else {
            return undefined;
        }
    }

    private static async getClip(slug: string): Promise<Clip | undefined> {
        const fetchResult = await Fetcher.fetch(
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

    /*
        TODO: MIGHT NEED UPDATED/SPECIAL ACCESS TOKEN DURING FETCHING
     */
    private static async getUser(name: string): Promise<User | undefined> {
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
}
