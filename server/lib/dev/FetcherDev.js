const fetch = require("node-fetch");

async function validAppAccessToken() {
  return true;
}

async function request100Streams(pagination) {
  const result = require("../../stubs/data/helix-streams-pagination");
  return Promise.resolve({
    json: () => Promise.resolve(result),
    status: 200,
  });
}

module.exports = {
  validAppAccessToken: validAppAccessToken,
  request100Streams: request100Streams,
};
