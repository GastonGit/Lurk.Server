import { fetchResult, User } from './Interfaces';
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
}
