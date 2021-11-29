import fetch, { Response } from 'node-fetch';
import { FetcherResponse, JSON } from './Interfaces';
import Logger from './Logger';

/*
    TODO: CLIENT_APP_ACCESS_TOKEN MIGHT NEED TO BE REFRESHED EVERY CALL
     (SEE FOR MORE: https://github.com/GastonGit/Hot-Twitch-Clips/commit/a2f77b0e19785414eb0693e01306aff074431441)
 */
async function fetchWrapper(url: string): Promise<Response> {
    return await fetch(url, {
        method: 'get',
        headers: {
            'Client-ID': process.env.CLIENT_ID || '',
            Authorization: ' Bearer ' + process.env.CLIENT_APP_ACCESS_TOKEN,
        },
    });
}

async function fetcherFetch(url: string): Promise<FetcherResponse> {
    if (process.env.NODE_ENV === 'development') {
        return {
            status: 200,
            data: [url],
            pagination: undefined,
        } as FetcherResponse;
    }

    const fullResponse = {
        status: -1,
        data: undefined,
        pagination: undefined,
    } as FetcherResponse;

    try {
        const response = await fetchWrapper(url);
        const json = (await response.json()) as JSON;

        fullResponse.status = response.status;
        fullResponse.data = json.data as Array<any>;
        fullResponse.pagination = json.pagination || undefined;
    } catch (err) {
        Logger.error('fetcherFetch', 'UNABLE TO COMPLETE FETCH', err as string);
    }

    return fullResponse;
}

export { fetcherFetch as fetch };
