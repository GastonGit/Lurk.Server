import { fetch } from './Fetcher';
import { User, Clip } from './Interfaces';

export default class Clipper {
    public async createClip(streamer: string): Promise<Clip | undefined> {
        const broadcasterID = await Clipper.getBroadcasterID(streamer);

        if (typeof broadcasterID !== 'undefined') {
            const fetchResponse = await fetch(
                'https://api.twitch.tv/helix/clips?broadcaster_id=' +
                    broadcasterID.toLowerCase(),
            );

            if (
                (fetchResponse.status === 200 ||
                    fetchResponse.status === 202) &&
                typeof fetchResponse.data !== 'undefined'
            ) {
                console.log(
                    '\x1b[32m%s\x1b[0m',
                    'createClip :: SUCCESS :: ' + streamer,
                );
                return fetchResponse.data[0];
            } else {
                console.log(
                    '\x1b[45m%s\x1b[0m',
                    'createClip :: FAILURE :: ' +
                        streamer +
                        ' (status code ' +
                        fetchResponse.status +
                        ')',
                );
                return undefined;
            }
        } else {
            return undefined;
        }
    }

    private static async getClip(slug: string): Promise<Clip | undefined> {
        const fetchResult = await fetch(
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

    private static async getBroadcasterID(
        id: string,
    ): Promise<string | undefined> {
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

        const fetchResult = await fetch(url);

        if (fetchResult.status === 200) {
            return fetchResult.data?.shift();
        } else {
            return undefined;
        }
    }
}
