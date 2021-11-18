const Fetcher = require("./Fetcher");
const helper = require("./helper");

class MonitorTwitchChat {
  streamList;
  requestCount;
  validMessages;
  client;
  compactStreamList;

  constructor(client, options) {
    this.requestCount = options.requestCount || 1;
    this.streamList = [];
    this.validMessages = options.validMessages || ["OMEGALUL"];
    this.compactStreamList = [];
    this.client = client;
    this.client.setMessageHandler(this.onMessageHandler.bind(this));
  }

  async connectToTwitch() {
    await this.client.connectToTwitch();
  }

  async updateChannels() {
    await this.leaveChannels();

    await this.updateStreamList();
    this.updateCompactStreamList();
    await this.client.joinChannels(this.getCompactStreamList());
  }

  async leaveChannels() {
    await this.client.leaveChannels(this.getCompactStreamList());
  }

  async joinChannels() {
    this.updateCompactStreamList();
    this.client.client.on(
      "connected",
      function () {
        this.client.joinChannels(this.getCompactStreamList());
      }.bind(this)
    );
  }

  decreaseHits(amount) {
    helper.ensureArgument(amount, "number");

    this.streamList.forEach(function (streamer) {
      if (streamer.hits - amount >= 0) {
        streamer.hits = streamer.hits - amount;
      } else {
        streamer.hits = 0;
      }
    });
  }

  updateCompactStreamList() {
    this.compactStreamList = [];
    let compactStreamList = this.compactStreamList;
    this.streamList.forEach(function (streamer) {
      compactStreamList.push(streamer.user_name);
    });
  }

  getCompactStreamList() {
    return this.compactStreamList;
  }

  onMessageHandler(channel, context, message, self) {
    if (!this.validMessages.includes(message)) {
      return;
    }

    channel = channel.substring(channel.indexOf("#") + 1);

    this.streamList[this.getStreamerIndex(channel)].hits += 1;
  }

  getStreamList() {
    return this.streamList;
  }

  cooldownStreamer(streamer, timeInSeconds) {
    helper.ensureArgument(streamer, "string");
    helper.ensureArgument(timeInSeconds, "number");

    const index = this.getStreamerIndex(streamer);

    if (typeof this.streamList[index] !== "undefined") {
      this.streamList[index].cooldown = true;
      setTimeout(
        function () {
          this.removeCooldownForStreamer(streamer);
        }.bind(this),
        timeInSeconds
      );
    }
  }

  removeCooldownForStreamer(streamer) {
    helper.ensureArgument(streamer, "string");

    const index = this.getStreamerIndex(streamer);

    if (typeof this.streamList[index] !== "undefined") {
      this.streamList[index].cooldown = false;
    }
  }

  async validAppAccessToken() {
    return Fetcher.validAppAccessToken();
  }

  resetStreamer(channel) {
    this.streamList[this.getStreamerIndex(channel)].hits = 0;
  }

  resetAllStreamers() {
    this.streamList.forEach(function (streamer) {
      streamer.hits = 0;
    });
  }

  getStreamerIndex(channel) {
    let userObject = this.streamList.find(
      (streamer) => streamer.user_name === channel.toLowerCase()
    );
    return this.streamList.indexOf(userObject);
  }

  async updateStreamList() {
    this.streamList = await this.requestStreams();
  }

  async requestStreams() {
    const validAAT = await this.validAppAccessToken();

    /* istanbul ignore if */
    if (!validAAT) {
      throw Error("Current App Access Token is invalid");
    }

    // TODO: Temp solution. Add to config.
    const blockedStreamers = ["nymn"];

    let streams = [];
    let pagination = undefined;

    for (let i = 0; i < this.requestCount; i++) {
      const fetchedStreams = await this.request100Streams(pagination);

      fetchedStreams.data.forEach(function (streamer) {
        if (!blockedStreamers.includes(streamer.user_login.toLowerCase())) {
          streams.push({
            user_name: streamer.user_login.toLowerCase(),
            viewer_count: parseInt(streamer.viewer_count),
            hits: 0,
            cooldown: false,
          });
        }
      });

      pagination = fetchedStreams.pagination.cursor;
    }

    return streams;
  }

  async request100Streams(pagination) {
    return await Fetcher.request100Streams(pagination);
  }
}

module.exports = MonitorTwitchChat;
