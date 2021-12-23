import nodeFetch, { Response } from 'node-fetch';
import { FetcherResponse } from './Interfaces';

export default class Fetcher {
    /*
    TODO: CLIENT_APP_ACCESS_TOKEN MIGHT NEED TO BE REFRESHED EVERY CALL
     (SEE FOR MORE: https://github.com/GastonGit/Hot-Twitch-Clips/commit/a2f77b0e19785414eb0693e01306aff074431441)
 */
    private static async nodeFetchWrapper(
        url: string,
        method: string,
    ): Promise<Response> {
        let accessToken;
        if (method === 'post') {
            const getAccessToken = await nodeFetch(
                'https://id.twitch.tv/oauth2/token?grant_type=refresh_token&refresh_token=' +
                    process.env.CLIENT_REFRESH +
                    '&client_id=' +
                    process.env.CLIENT_ID +
                    '&client_secret=' +
                    process.env.CLIENT_SECRET,
                {
                    method: 'post',
                },
            );
            const accessJSON = await getAccessToken.json();

            accessToken = accessJSON.access_token;
        } else {
            accessToken = process.env.CLIENT_APP_ACCESS_TOKEN;
        }

        return await nodeFetch(url, {
            method: method,
            headers: {
                'Client-ID': process.env.CLIENT_ID || '',
                Authorization: ' Bearer ' + accessToken,
            },
        });
    }

    public static async fetch(
        url: string,
        method: string,
    ): Promise<FetcherResponse> {
        if (method !== 'post' && method !== 'get') {
            throw Error('fetcherFetch :: INVALID METHOD');
        }

        if (process.env.NODE_ENV === 'development') {
            return {
                ok: true,
                status: 200,
                data: [] as Array<any>,
                pagination: undefined,
            } as FetcherResponse;
        }

        try {
            const response = await this.nodeFetchWrapper(url, method);
            const json = await response.json?.();

            return {
                ok: response.ok,
                status: response.status,
                data: json?.data || [],
                pagination: json?.pagination || undefined,
            };
        } catch (err) {
            throw Error('fetcherFetch :: UNABLE TO COMPLETE FETCH :: ' + err);
        }
    }
}
