import fetch from 'node-fetch';
import { request100Streams, validAppAccessToken } from './dev/FetcherDev';

let exportValidAppAccessToken;
let exportRequest100Streams;

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

async function realValidAppAccessToken(): Promise<boolean> {
    const url = 'https://api.twitch.tv/helix/users?id=141981764';
    let status = 401;

    try {
        const response = await fetchWrapper(url);
        status = response.status;
    } catch (e) {
        console.error(e);
    }

    return status !== 401;
}

async function realRequest100Streams(pagination: any) {
    let url = 'https://api.twitch.tv/helix/streams?first=100&language=en';

    if (pagination) {
        url += '&after=' + pagination;
    }

    const response = await fetch(url, {
        method: 'get',
        headers: {
            'Client-ID': process.env.CLIENT_ID || '',
            Authorization: ' Bearer ' + process.env.CLIENT_APP_ACCESS_TOKEN,
        },
    });

    return await response.json();
}

if (process.env.NODE_ENV === 'development') {
    exportValidAppAccessToken = validAppAccessToken;
    exportRequest100Streams = request100Streams;
} else {
    exportValidAppAccessToken = realValidAppAccessToken;
    exportRequest100Streams = realRequest100Streams;
}

export { exportValidAppAccessToken as validAppAccessToken };
export { exportRequest100Streams as request100Streams };
export { getStatus as getStatus };
