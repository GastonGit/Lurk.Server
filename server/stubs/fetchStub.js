
const fetchStub = function (url, options){
    // https://dev.twitch.tv/docs/api/reference#get-streams
    if (url === "https://api.twitch.tv/helix/streams?first=100&language=en"){
        if (options.method === "get"){
            const result = require("../stubs/data/helix-streams")
            return Promise.resolve({
                json: () => Promise.resolve(result),
                status: 200
            })
        } else{
            throw new Error("(fetchStub): Unexpected method");
        }
    }
    if (url === "https://api.twitch.tv/helix/streams?first=100&language=en&after=eyJiIjp7IkN1cnNvciI6ImV5SnpJam8wT1RJM05p" +
        "NDBPVGc0TlRreU5UYzFOVFFzSW1RaU9tWmhiSE5sTENKMElqcDBjblZsZlE9PSJ9LCJhIjp7IkN1cnNvciI6ImV5SnpJam96Tnpj" +
        "MUxqRXdNakE1TURrME9USTNPU3dpWkNJNlptRnNjMlVzSW5RaU9uUnlkV1Y5In19"){
        if (options.method === "get"){
            const result = require("../stubs/data/helix-streams-pagination")
            return Promise.resolve({
                json: () => Promise.resolve(result),
                status: 200
            })
        }
        else{
            throw new Error("(fetchStub): Unexpected method");
        }
    }
    if (url === "https://api.twitch.tv/helix/users?login=moonmoon"){
        if (options.method === "get"){
            const result = {"data":[{"id": "121059319"}]}
            return Promise.resolve({
                json: () => Promise.resolve(result),
                status: 200
            })
        }
        else{
            throw new Error("(fetchStub): Unexpected method");
        }
    }

    if (url.includes("https://id.twitch.tv/oauth2/token?grant_type=refresh_token&refresh_token=")){
        if (options.method === "post"){
            const result = {"access_token": "j9b1e59"}
            return Promise.resolve({
                json: () => Promise.resolve(result),
                status: 200
            })
        }
        else{
            throw new Error("(fetchStub): Unexpected method");
        }
    }

    if (url.includes("https://api.twitch.tv/helix/clips?id=MISS")){
        const result = {
            "data": []
        }
        return Promise.resolve({
            json: () => Promise.resolve(result),
            status: 200
        })
    }

    if (url.includes("https://api.twitch.tv/helix/clips?broadcaster_id=")){
        if (options.method === "post"){
            const result = {
                "data": [
                    {
                        "id": "EphemeralClumsyCatKAPOW-SzCaOix1-olnn42x",
                        "edit_url": "https://clips.twitch.tv/EphemeralClumsyCatKAPOW-SzCaOix1-olnn42x/edit"
                    }
                ]
            }
            return Promise.resolve({
                json: () => Promise.resolve(result),
                status: 200
            })
        }
        else{
            throw new Error("(fetchStub): Unexpected method");
        }
    }

    if (url.includes("https://api.twitch.tv/helix/clips?id=")){
        if (options.method === "get"){
            const result = {
                "data": [
                    {
                        "id": "SpunkySecretiveOrangeShadyLulu-KCNPm3bm3KTbuOCl",
                        "thumbnail_url": "https://clips-media-assets2.twitch.tv/AT-cm%7C1140679825-preview-480x272.jpg",
                    }
                ]
            }
            return Promise.resolve({
                json: () => Promise.resolve(result),
                status: 200
            })
        }
        else{
            throw new Error("(fetchStub): Unexpected method");
        }
    }


    throw new Error("(fetchStub): Unexpected url: " + url);
};

module.exports = fetchStub;