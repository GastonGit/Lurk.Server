let list = [];

let client = function(options){
    this.identity = options.identity;
    return this;
}

client.prototype.on = function on(type, func){
    this.msgHandler = func;
}

client.prototype.getMessageHandler = function getMessageHandler(){
    return this.msgHandler;
}

client.prototype.connect = function connect(){
    return Promise.resolve(['server','port']);
}

client.prototype.getIdentity = function getIdentity(){
    return this.identity;
}

client.prototype.join = function join(channel){
    list.push(channel);

    return Promise.resolve([channel])
}

client.prototype.joinedChannels = function joinedChannels(){
    return list;
}

module.exports = client;