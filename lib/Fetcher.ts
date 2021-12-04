import fetch, { Response } from 'node-fetch';
import { FetcherResponse } from './Interfaces';

export default class Fetcher {
    /*
    TODO: CLIENT_APP_ACCESS_TOKEN MIGHT NEED TO BE REFRESHED EVERY CALL
     (SEE FOR MORE: https://github.com/GastonGit/Hot-Twitch-Clips/commit/a2f77b0e19785414eb0693e01306aff074431441)
 */
    private static async fetchWrapper(url: string): Promise<Response> {
        return await fetch(url, {
            method: 'get',
            headers: {
                'Client-ID': process.env.CLIENT_ID || '',
                Authorization: ' Bearer ' + process.env.CLIENT_APP_ACCESS_TOKEN,
            },
        });
    }

    public static async fetch(url: string): Promise<FetcherResponse> {
        if (process.env.NODE_ENV === 'development') {
            return {
                status: 200,
                data: [] as Array<any>,
                pagination: undefined,
            } as FetcherResponse;
        }

        const fullResponse = {
            status: -1,
            data: [],
            pagination: undefined,
        } as FetcherResponse;

        try {
            const response = await this.fetchWrapper(url);
            const json = await response.json();

            fullResponse.status = response.status;
            fullResponse.data = (json.data as Array<any>) || [];
            fullResponse.pagination = json.pagination || undefined;
        } catch (err) {
            throw Error('fetcherFetch :: UNABLE TO COMPLETE FETCH :: ' + err);
        }

        return fullResponse;
    }
}
