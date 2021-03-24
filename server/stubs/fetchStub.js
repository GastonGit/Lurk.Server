
const fetchStub = function (url, options){
    // https://dev.twitch.tv/docs/api/reference#get-streams
    if (url === "https://api.twitch.tv/helix/streams?first=100"){
        if (options.method === "get"){
            const result = require("../stubs/data/helix-streams")
            return Promise.resolve({
                json: () => Promise.resolve(result),
                status: 200
            })
        } else{
            throw new Error("Unexpected method");
        }
    }
    if (url === "https://api.twitch.tv/helix/streams?first=100&after=eyJiIjp7IkN1cnNvciI6ImV5SnpJam8wT1RJM05p" +
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
            throw new Error("Unexpected method");
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
            throw new Error("Unexpected method");
        }
    }

    if (url.includes("https://id.twitch.tv/oauth2/token?grant_type=refresh_token&refresh_token=")){
        if (options.method === "get"){
            const result = {"access_token": "j9b1e59"}
            return Promise.resolve({
                json: () => Promise.resolve(result),
                status: 200
            })
        }
        else{
            throw new Error("Unexpected method");
        }
    }



    throw new Error("Unexpected url");
};

module.exports = fetchStub;