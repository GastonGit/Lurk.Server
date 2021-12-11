import { fetchResult } from './Interfaces';
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
}
