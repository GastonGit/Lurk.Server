import { FetcherResponse } from '../Interfaces';

async function fetcherFetch(url: string): Promise<FetcherResponse> {
    return {
        status: 200,
        data: [url],
        pagination: undefined,
    } as FetcherResponse;
}

export { fetcherFetch };
