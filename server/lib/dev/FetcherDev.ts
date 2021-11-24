import result from '../../stubs/data/helix-streams-pagination';

async function getStatus(url: string): Promise<number> {
    console.log(url);
    return 400;
}

async function getJSON(url: string): Promise<unknown> {
    console.log(url);
    return { data: [] };
}

async function validAppAccessToken(): Promise<boolean> {
    return true;
}

async function request100Streams(pagination: any): Promise<any> {
    console.log(pagination);
    return Promise.resolve({
        json: () => Promise.resolve(result),
        status: 200,
    });
}

export { getStatus as getStatus };
export { getJSON as getJSON };

export { validAppAccessToken as validAppAccessToken };
export { request100Streams as request100Streams };
