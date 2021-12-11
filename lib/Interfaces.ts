export interface Stream {
    user_name: string;
    viewer_count: number;
    hits: number;
    cooldown: boolean;
}

export interface User {
    id: string;
    login: string;
    display_name: string;
    type: string;
    broadcaster_type: string;
    description: string;
    profile_image_url: string;
    offline_image_url: string;
    view_count: number;
    email: string;
    created_at: string;
}

export interface FetchedStreams {
    user_login: string;
    viewer_count: number;
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
    data: Array<any>;
    pagination: { cursor: string } | undefined;
}
