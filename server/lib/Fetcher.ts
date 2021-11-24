import fetch, { Response } from 'node-fetch';
import {
    getStatus as getStatusDev,
    getJSON as getJSONDev,
    getResponse as getResponseDev,
} from './dev/FetcherDev';

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
