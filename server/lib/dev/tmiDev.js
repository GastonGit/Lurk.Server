const tmi = require("tmi.js");
let client = require("../../stubs/tmiClientStub");

if (process.env.NODE_ENV === "development") {
  module.exports = {
    client,
    Client: client,
  };
} else {
  module.exports = tmi;
}
