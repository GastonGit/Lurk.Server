import fetch from 'node-fetch';
import {
    getStatus as getStatusDev,
    getJSON as getJSONDev,
} from './dev/FetcherDev';

let getStatusExport;
let getJSONExport;

async function fetchWrapper(url: string) {
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

if (process.env.NODE_ENV === 'development') {
    getStatusExport = getStatusDev;
    getJSONExport = getJSONDev;
} else {
    getStatusExport = getStatus;
    getJSONExport = getJSON;
}

export { getStatusExport as getStatus };
export { getJSONExport as getJSON };
