async function getStatus(url: string): Promise<number> {
    console.log(url);
    return 400;
}

async function getJSON(url: string): Promise<unknown> {
    console.log(url);
    return { data: [] };
}

export { getStatus as getStatus };
export { getJSON as getJSON };
