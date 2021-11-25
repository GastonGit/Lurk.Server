export interface Stream {
    user_name: string;
    viewer_count: number;
    hits: number;
    cooldown: boolean;
}

export interface FetchedStreams {
    user_login: string;
    viewer_count: string;
}

export interface Streams {
    success: boolean;
    streams: Array<Stream>;
}

export interface fetchResult {
    success: boolean;
    data: Array<FetchedStreams>;
    pagination: { cursor: string } | undefined;
}

export interface Clip {
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

export interface FetcherResponse {
    status: number;
    data: unknown;
    pagination: { cursor: string } | undefined;
}

export interface Data {
    data: Array<any>;
}

export interface JSON {
    data: unknown;
    pagination: { cursor: string } | undefined;
}

export interface Config {
    spikeValue: number;
    spikeTime: number;
    reduceValue: number;
    reduceTime: number;
    cooldownLengthInSeconds: number;
    addClipDelay: number;
    removeClipTimeInMinutes: number;
    updateTimeInMinutes: number;
    joinTimeout: number;
    requestCount: number;
    validMessages: string[];
}
