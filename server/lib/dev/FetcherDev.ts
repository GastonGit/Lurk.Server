import result from '../../stubs/data/helix-streams-pagination';

async function validAppAccessToken() {
    return true;
}

async function request100Streams(pagination: any) {
    console.log(pagination);
    return Promise.resolve({
        json: () => Promise.resolve(result),
        status: 200,
    });
}

export { validAppAccessToken as validAppAccessToken };
export { request100Streams as request100Streams };
