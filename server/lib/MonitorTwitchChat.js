const tmi = require('tmi.js');

class MonitorTwitchChat{

    streamList;

    constructor() {

        this.streamList = [];
    }

    getStreamList(){
        return this.streamList;
    }

    updateStreamList(response){
        if (typeof response === "undefined"){
            throw new Error("Argument is undefined");
        }

        let streamList = this.streamList;

        response["data"].forEach(function(channel){
            streamList.push({
                user_name: channel.user_name,
                viewer_count: channel.viewer_count
            })
        })
    }

    requestStreams(){
        return {};
    }
}

module.exports = MonitorTwitchChat;