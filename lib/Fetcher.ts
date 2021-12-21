import nodeFetch, { Response } from 'node-fetch';
import { FetcherResponse } from './Interfaces';
import Logger from './Logger';

export default class Fetcher {
    /*
    TODO: CLIENT_APP_ACCESS_TOKEN MIGHT NEED TO BE REFRESHED EVERY CALL
     (SEE FOR MORE: https://github.com/GastonGit/Hot-Twitch-Clips/commit/a2f77b0e19785414eb0693e01306aff074431441)
 */
    private static async nodeFetchWrapper(
        url: string,
        method: string,
    ): Promise<Response> {
        return await nodeFetch(url, {
            method: method,
            headers: {
                'Client-ID': process.env.CLIENT_ID || '',
                Authorization: ' Bearer ' + process.env.CLIENT_APP_ACCESS_TOKEN,
            },
        });
    }

    public static async fetch(
        url: string,
        method: string,
    ): Promise<FetcherResponse> {
        if (process.env.NODE_ENV === 'development') {
            return {
                ok: true,
                data: [] as Array<any>,
                pagination: undefined,
            } as FetcherResponse;
        }

        try {
            if (method !== 'post' && method !== 'get') {
                throw Error('fetcherFetch :: INVALID METHOD');
            }
            const response = await this.nodeFetchWrapper(url, method);

            if (response.ok) {
                const json = await response.json();
                return {
                    ok: true,
                    data: json.data,
                    pagination: json.pagination,
                };
            } else {
                Logger.failure(
                    'fetcherFetch',
                    'unexpected response status code',
                    response.status.toString(),
                );
                return { ok: false, data: [], pagination: undefined };
            }
        } catch (err) {
            throw Error('fetcherFetch :: UNABLE TO COMPLETE FETCH :: ' + err);
        }
    }
}
