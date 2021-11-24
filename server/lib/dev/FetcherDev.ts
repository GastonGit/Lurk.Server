async function getStatus(url: string): Promise<number> {
    console.log(url);
    return 400;
}

async function getJSON(url: string): Promise<unknown> {
    console.log(url);
    return { data: [] };
}

async function fetchWrapper(url: string): Promise<unknown> {
    console.log(url);
    const result = { data: [{ id: '121059319' }] };
    return Promise.resolve({
        json: () => Promise.resolve(result),
        status: 200,
    });
}

export { getStatus as getStatus };
export { getJSON as getJSON };
export { fetchWrapper as getResponse };
