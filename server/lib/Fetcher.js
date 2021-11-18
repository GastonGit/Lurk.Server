const fetch = require("node-fetch");
const fakeFetch = require("./dev/FetcherDev");

async function validAppAccessToken() {
  const url = "https://api.twitch.tv/helix/users?id=141981764";

  const response = await fetch(url, {
    method: "get",
    headers: {
      "Client-ID": process.env.CLIENT_ID,
      Authorization: " Bearer " + process.env.CLIENT_APP_ACCESS_TOKEN,
    },
  });

  const status = await response.status;

  return status !== 401;
}

async function request100Streams(pagination) {
  let url = "https://api.twitch.tv/helix/streams?first=100&language=en";

  if (pagination) {
    url += "&after=" + pagination;
  }

  const response = await fetch(url, {
    method: "get",
    headers: {
      "Client-ID": process.env.CLIENT_ID,
      Authorization: " Bearer " + process.env.CLIENT_APP_ACCESS_TOKEN,
    },
  });

  return await response.json();
}

if (process.env.NODE_ENV === "development") {
  module.exports = {
    validAppAccessToken: fakeFetch.validAppAccessToken,
    request100Streams: fakeFetch.request100Streams,
  };
} else {
  module.exports = {
    validAppAccessToken: validAppAccessToken,
    request100Streams: request100Streams,
  };
}
