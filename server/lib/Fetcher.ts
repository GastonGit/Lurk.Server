import fetch, { Response } from 'node-fetch';
import {
    getStatus as getStatusDev,
    getJSON as getJSONDev,
    getResponse as getResponseDev,
} from './dev/FetcherDev';

interface Clip {
    id: string;
    url: string;
    embed_url: string;
    broadcaster_id: string;
    broadcaster_name: string;
    creator_id: string;
    creator_name: string;
    video_id: string;
    game_id: string;
    language: string;
    title: string;
    view_count: number;
    created_at: string;
    thumbnail_url: string;
    duration: number;
}

interface FetcherResponse {
    status: number;
    data: unknown;
    pagination: { cursor: string } | undefined;
}

interface Stream {
    user_name: string;
    viewer_count: number;
    hits: number;
    cooldown: boolean;
}

interface Data {
    data: Array<any>;
}

interface JSON {
    data: unknown;
    pagination: { cursor: string } | undefined;
}

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
    const fullResponse = {
        status: -1,
        data: undefined,
        pagination: undefined,
    } as FetcherResponse;

    try {
        const response = await fetchWrapper(url);
        const json = (await response.json()) as JSON;

        fullResponse.status = response.status;
        fullResponse.data = json.data;
        fullResponse.pagination = json.pagination || undefined;
    } catch (e) {
        console.error(e);
    }

    return fullResponse;
}

async function getStatus(url: string): Promise<number> {
    let status = -1;

    try {
        const response = await fetchWrapper(url);
        status = response.status;
    } catch (e) {
        console.error(e);
    }

    return status;
}

async function getJSON(url: string): Promise<unknown> {
    let json;

    try {
        const response = await fetchWrapper(url);
        json = response.json();
    } catch (e) {
        console.error(e);
    }

    return json;
}

async function getClip(url: string): Promise<Clip> {
    let clip;

    try {
        const response = (await getJSON(url)) as Data;
        clip = response.data[0];
    } catch (e) {
        console.error(e);
    }

    return clip;
}

let getStatusExport: (url: string) => Promise<number>;
let getJSONExport: (url: string) => Promise<unknown>;
let getResponseExport: (url: string) => Promise<unknown>;

if (process.env.NODE_ENV === 'development') {
    getStatusExport = getStatusDev as typeof getStatus;
    getJSONExport = getJSONDev as typeof getJSON;
    getResponseExport = getResponseDev as typeof fetchWrapper;
} else {
    getStatusExport = getStatus;
    getJSONExport = getJSON;
    getResponseExport = fetchWrapper;
}

export { getStatusExport as getStatus };
export { getJSONExport as getJSON };
export { getResponseExport as getResponse };
export { getClip as getClip };
export { fetcherFetch as fetch };
