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
        it('should not throw when called', function() {
            expect(function(){
                TwitchClient.connectToTwitch()
            }).to.not.throw()
        });
        it('should return an array when resolved', async function() {
            const result = await TwitchClient.connectToTwitch();
            expect(result).to.deep.equal(['server', 'port']);
        });
        it('should return an array when resolved', async function() {
            const result = await TwitchClient.connectToTwitch();
            expect(result).to.deep.equal(['server', 'port']);
        });
        it('should return error message when rejected', async function() {
            let client = function(options){
                this.identity = options.identity;
                return this;
            }
            client.prototype.connect = function connect(){
                return Promise.reject('ERROR123');
            }
            client.prototype.on = function on(){

            }

            const tmiStubInner = {
                client,
                Client: client
            }
            let TwitchClientClassInner = proxyquire('../lib/TwitchClient',{'tmi.js':tmiStubInner});
            let TwitchClientInner = new TwitchClientClassInner();

            const result = await TwitchClientInner.connectToTwitch();
            expect(result).to.be.equal('Error connecting to Twitch: ERROR123');
        });
    });
    describe('setMessageHandler', function() {
        it('should throw without an argument', function() {
            expect(function(){TwitchClient.setMessageHandler()}).to.throw();
        });
        it('should take a function as an argument', function() {
            expect(function(){TwitchClient.setMessageHandler(function (){
                return 0;
            })}).to.not.throw();
            expect(function(){TwitchClient.setMessageHandler('string')}).to.throw();
            expect(function(){TwitchClient.setMessageHandler(NaN)}).to.throw();
        });
        it('should set messageHandler to given function', function() {
            let testHandler = function(){return 0};
            TwitchClient.setMessageHandler(testHandler)
            expect(TwitchClient.client.getMessageHandler()).to.deep.equal(testHandler)
        });
    });
    describe('joinChannels', function() {
        it('should take an array argument', async function() {
            await expect(TwitchClient.joinChannels()).to.be.rejectedWith('Argument is undefined');
            await expect(TwitchClient.joinChannels(123)).to.be.rejectedWith('Argument is not an array');
            await expect(TwitchClient.joinChannels([''])).to.be.fulfilled;
        });
        it('should join all channels given in an array', function(done) {
            TwitchClient.joinTimeout = 0;
            let channels = ['kappa','poggers','pogchamp','greyface']
            TwitchClient.joinChannels(channels);

            let checkExpect = function(){
                expect(TwitchClient.client.joinedChannels()).to.include.members(channels)
                done();
            }

            setTimeout(checkExpect, 50);
        });
        it('should not throw when rejected', async function() {
            let client = function(options){
                this.identity = options.identity;
                return this;
            }
            client.prototype.join = function connect(){
                return Promise.reject('ERROR123');
            }

            const tmiStubInner = {
                client,
                Client: client
            }
            let TwitchClientClassInner = proxyquire('../lib/TwitchClient',{'tmi.js':tmiStubInner});
            let TwitchClientInner = new TwitchClientClassInner();

            let channels = ['kappa','poggers','pogchamp','greyface']
            expect(async function (){await TwitchClientInner.joinChannels(channels)}).to.not.throw();
        });
    });
    describe('leaveChannels', function() {
        it('should take an array argument', async function() {
            await expect(TwitchClient.leaveChannels()).to.be.rejectedWith('Argument is undefined');
            await expect(TwitchClient.leaveChannels(123)).to.be.rejectedWith('Argument is not an array');
            await expect(TwitchClient.leaveChannels([''])).to.be.fulfilled;
        });
        it('should leave all current channels', function(done) {
            TwitchClient.joinTimeout = 0;
            let channels = ['kappa','poggers','pogchamp','greyface']
            TwitchClient.joinChannels(channels);
            TwitchClient.leaveChannels(channels)

            let checkExpect = function(){
                expect(TwitchClient.client.joinedChannels()).to.not.include.members(channels)
                done();
            }

            setTimeout(checkExpect, 10);
        });
    });
});