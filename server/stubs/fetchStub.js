
const fetchStub =  function (url, options){
    // https://dev.twitch.tv/docs/api/reference#get-streams
    if (url === "https://api.twitch.tv/helix/streams"){
        if (options.method === "get"){
            const result = require("../stubs/data/helix-streams")
            return Promise.resolve({
                json: () => Promise.resolve(result)
            })
        }
    }
};

module.exports = fetchStub;