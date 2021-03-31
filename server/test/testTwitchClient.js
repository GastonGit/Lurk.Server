const chai = require('chai')
const spies = require('chai-spies');
const chai_as_promised = require('chai-as-promised')
chai.use(spies);
chai.use(chai_as_promised);
const assert = chai.assert;
const expect = chai.expect;

const proxyquire = require('proxyquire');
const tmiStub = require('../stubs/tmiStub');

let TwitchClientClass = proxyquire('../lib/TwitchClient',{'tmi.js':tmiStub});
let TwitchClient;

describe('TwitchClient methods', function() {
    beforeEach(function (){
        TwitchClient = new TwitchClientClass();
    })
    describe('constructor', function() {
        it('should set username and password for client', function() {
            expect(TwitchClient.client.getIdentity()).to.have.all.keys('username','password');
        });
    });
    describe('connectToTwitch', function() {
        it('should not throw', function() {
            expect(function(){
                TwitchClient.connectToTwitch()
            }).to.not.throw()
        });
    });
    describe('setMessageHandler', function() {
        it('should set messageHandler to given function', function() {
            let testHandler = function(){return 0};
            TwitchClient.setMessageHandler(testHandler)
            expect(TwitchClient.client.getMessageHandler()).to.deep.equal(testHandler)
        });
    });
    describe('joinChannels', function() {
        it('should join all channels given in an array', function() {
            let channels = ['kappa','poggers','pogchamp','greyface']
            TwitchClient.joinChannels(channels);
            expect(TwitchClient.client.joinedChannels()).to.include.members(channels)
        });
    });
});