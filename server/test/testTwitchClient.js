const chai = require('chai')
const spies = require('chai-spies');
const chai_as_promised = require('chai-as-promised')
chai.use(spies);
chai.use(chai_as_promised);
const assert = chai.assert;
const expect = chai.expect;


const proxyquire = require('proxyquire');
const tmiStub = require('../stubs/tmiStub');
const fetchStub = require('../stubs/fetchStub');

let TwitchClientClass = proxyquire('../lib/TwitchClient',{'tmi.js':tmiStub, 'node-fetch':fetchStub});
let TwitchClient;

describe('testTwitchClient methods', function() {
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
    describe('getBroadcasterID', function() {
        it('should throw if not supplied with a defined argument', async function() {
            await expect(TwitchClient.getBroadcasterID()).to.be.rejected
            await expect(TwitchClient.getBroadcasterID()).to.be.rejectedWith("Argument is undefined");
        });
        it('should return a twitch users broadcaster id as a string', async function() {
            const result = await TwitchClient.getBroadcasterID("moonmoon");
            expect(result).to.be.a('string');
            expect(parseInt(result)).to.equal(121059319)
        });
        it('should return a twitch users broadcaster id as a string', async function() {
            const result = await TwitchClient.getBroadcasterID("moonmoon");
            expect(result).to.be.a('string');
            expect(parseInt(result)).to.equal(121059319)
        });
    });
    describe('getUser', function() {
        it('should throw if not supplied with a defined argument', async function() {
            await expect(TwitchClient.getUser()).to.be.rejected
            await expect(TwitchClient.getUser()).to.be.rejectedWith("Argument is undefined");
        });
        it('should throw if status code is not 200', async function() {
            const fetchStubInner = function(){
                return Promise.resolve({
                    status: 401
                })
            };
            let TwitchClientClassInner = proxyquire('../lib/TwitchClient',{'tmi.js':tmiStub, 'node-fetch':fetchStubInner});
            let TwitchClientInner = new TwitchClientClassInner();

            await expect(TwitchClientInner.getUser("moonmoon")).to.be.rejectedWith('Status code is: 401');
        });
        it('should not throw if status code is 200', async function() {
            await expect(TwitchClient.getUser("moonmoon")).to.eventually.have.property("data")
        });
        it('should return an object', async function() {
            const result = await TwitchClient.getUser("moonmoon");
            expect(result).to.be.an('object');
        });
    });
});