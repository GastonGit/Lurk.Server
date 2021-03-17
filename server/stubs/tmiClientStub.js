let list = [];

let client = function(options){

}

client.prototype.on = function on(){

}

client.prototype.connect = function connect(){

}

client.prototype.join = function join(channel){
    list.push(channel);

    return Promise.resolve({

    })
}

client.prototype.joinedChannels = function joinedChannels(){
    return list;
}

module.exports = client;