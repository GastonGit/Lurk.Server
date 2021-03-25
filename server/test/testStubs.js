const chai = require('chai')
const spies = require('chai-spies');
const chai_as_promised = require('chai-as-promised')
chai.use(spies);
chai.use(chai_as_promised);
const assert = chai.assert;
const expect = chai.expect;
chai.should();

let fetchStub = require('../stubs/fetchStub');
let TwitchClientStubClass = require('../stubs/twitchClientStub');
let TwitchClientStub = new TwitchClientStubClass();
describe('testStubs', function (){
    describe('fetchStub methods', function() {
        describe('unexpected arguments', function() {
            it('should throw if not used with existing url', function() {
                expect(function(){fetchStub("test.com")}).to.throw();
            });
            describe('with expected url', function() {
                it('should throw if not used with the method option get', function() {
                    expect(function(){fetchStub("https://api.twitch.tv/helix/streams?first=100")}).to.throw();
                    expect(function(){fetchStub(
                        "https://api.twitch.tv/helix/streams?first=100",
                        {
                            method: "post"
                        }
                    )}).to.throw();
                });
            });
            describe('with expected pagination url', function() {
                it('should throw if not used with the method option get', function() {
                    expect(function(){fetchStub("https://api.twitch.tv/helix/streams?first=100&after=eyJiIjp7I" +
                        "kN1cnNvciI6ImV5SnpJam8wT1RJM05pNDBPVGc0TlRreU5UYzFOVFFzSW1RaU9tWmhiSE5sTENKMElqcDBjbl" +
                        "ZsZlE9PSJ9LCJhIjp7IkN1cnNvciI6ImV5SnpJam96TnpjMUxqRXdNakE1TURrME9USTNPU3dpWkNJNlptRnN" +
                        "jMlVzSW5RaU9uUnlkV1Y5In19")}).to.throw();
                    expect(function(){fetchStub(
                        "https://api.twitch.tv/helix/streams?first=100&after=eyJiIjp7IkN1cnNvciI6ImV5SnpJam8wT" +
                        "1RJM05pNDBPVGc0TlRreU5UYzFOVFFzSW1RaU9tWmhiSE5sTENKMElqcDBjblZsZlE9PSJ9LCJhIjp7IkN1cn" +
                        "NvciI6ImV5SnpJam96TnpjMUxqRXdNakE1TURrME9USTNPU3dpWkNJNlptRnNjMlVzSW5RaU9uUnlkV1Y5In19",
                        {
                            method: "post"
                        }
                    )}).to.throw();
                });
            });
            describe('with user login url', function() {
                it('should throw if not used with the method option get', function() {
                    expect(function(){fetchStub("https://api.twitch.tv/helix/users?login=moonmoon")}).to.throw();
                    expect(function(){fetchStub(
                        "https://api.twitch.tv/helix/users?login=moonmoon",
                        {
                            method: "post"
                        }
                    )}).to.throw();
                });
            });
            describe('with user login url', function() {
                it('should throw if not used with the method option get', function() {
                    expect(function(){fetchStub('https://id.twitch.tv/oauth2/token?grant_type=refresh_token&refresh_token=123&client_id=0&client_secret=321')}).to.throw();
                    expect(function(){fetchStub(
                        'https://id.twitch.tv/oauth2/token?grant_type=refresh_token&refresh_token=123&client_id=0&client_secret=321',
                        {
                            method: "post"
                        }
                    )}).to.throw();
                });
            });
        });
    });
    describe('twitchClientStub', function() {
        describe('connectToTwitch', function() {
            it('should not throw when called', function() {
                expect(TwitchClientStub.connectToTwitch).to.not.throw();
            });
        });
        describe('getAccessToken', function() {
            it('should return a string', async function() {
                return TwitchClientStub.getAccessToken().should.eventually.equal('accesstoken');
            });
        });
        describe('getBroadcasterID', function() {
            it('should return a string', function() {
                return TwitchClientStub.getBroadcasterID('stringarg').should.eventually.equal('broadcasterid');
            });
            it('should throw if not used with a string argument', async function() {
                await expect(TwitchClientStub.getBroadcasterID()).to.be.rejectedWith('Argument is undefined');
                await expect(TwitchClientStub.getBroadcasterID(123)).to.be.rejectedWith('Argument is not a string');
                await expect(TwitchClientStub.getBroadcasterID([])).to.be.rejectedWith('Argument is not a string');
            });
        });
        describe('getUser', function() {
            it('should throw when called without a string argument', async function() {
                await expect(TwitchClientStub.getUser()).to.be.rejectedWith('Argument is undefined');
                await expect(TwitchClientStub.getUser(123)).to.be.rejectedWith('Argument is not a string');
                await expect(TwitchClientStub.getUser([])).to.be.rejectedWith('Argument is not a string');

            });
            it('should return an object', function() {
                return TwitchClientStub.getUser('stringarg').should.eventually.deep.equal({"data":[]});
            });
        });
        describe('setMessageHandler', function() {
            it('should throw when called without a function argument', function() {
                expect(function(){TwitchClientStub.setMessageHandler(function(){})}).to.not.throw();
                expect(function(){TwitchClientStub.setMessageHandler()}).to.throw();
                expect(function(){TwitchClientStub.setMessageHandler(123)}).to.throw();
            });
        });
        describe('joinChannels', function() {
            it('should throw when called without a string argument', function() {
                expect(function(){TwitchClientStub.joinChannels('stringag')}).to.not.throw();
                expect(function(){TwitchClientStub.joinChannels()}).to.throw();
                expect(function(){TwitchClientStub.joinChannels(123)}).to.throw();
            });
        });
    });
});
