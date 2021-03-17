const chai = require('chai')
const spies = require('chai-spies');
chai.use(spies);
const assert = chai.assert;
const expect = chai.expect

const proxyquire = require('proxyquire');
const fetchStub = require('../stubs/fetchStub');

let MonitorTwitchChatClass = proxyquire('../lib/MonitorTwitchChat', {'node-fetch':fetchStub});
let MonitorTwitchChat;

describe('MonitorTwitchChat methods', function() {
    beforeEach(function (){
        MonitorTwitchChat = new MonitorTwitchChatClass({
            requestCount: 2
        });
    })
    describe('constructor', function() {
        it('should set requestCount to specified when specified', function() {
            const count = 5;
            MonitorTwitchChat = new MonitorTwitchChatClass({
                requestCount: count
            });
            expect(MonitorTwitchChat.requestCount).to.equal(count);
        });
        it('should set requestCount to 2 when not specified', function() {
            MonitorTwitchChat = new MonitorTwitchChatClass({});
            expect(MonitorTwitchChat.requestCount).to.equal(2);
        });
    });
    describe('getStreamList', function() {
        it('should return an array', function() {
            assert.isArray(MonitorTwitchChat.getStreamList());
        });
        it('should be an empty on init', function() {
            expect(MonitorTwitchChat.getStreamList()).to.be.empty;
        });
    });
    describe('requestStreams', function() {
        it('should return an array that is not empty', async function() {
            const result = await MonitorTwitchChat.requestStreams()
            expect(result).to.be.an('array');
            expect(result).to.not.be.empty;
        });
        it('should return an array that contains objects of user_name, viewer_count and hits', async function() {
            const result = await MonitorTwitchChat.requestStreams();
            expect(result[0]).to.be.an('object').that.includes.all.keys('user_name','viewer_count','hits');
        });
        it('should return an array that contain objects with string key user_name', async function() {
            const result = await MonitorTwitchChat.requestStreams();
            assert.isString(result[0].user_name);
        });
        it('should return an array that contain objects with number key viewer_count', async function() {
            const result = await MonitorTwitchChat.requestStreams();
            assert.isNumber(result[0].viewer_count);
        });
        it('should return an array that contain objects with number key hits', async function() {
            const result = await MonitorTwitchChat.requestStreams();
            assert.isNumber(result[0].hits);
        });
        it('should return with data from helix-stream', async function() {
            const result = await MonitorTwitchChat.requestStreams();
            expect(result).to.deep.include({
                user_name:"kyle", viewer_count:7851, hits:0
            })
        });
        it('should return with data from helix-stream-pagination', async function() {
            const result = await MonitorTwitchChat.requestStreams();
            expect(result).to.deep.include({
                user_name:"saiiren", viewer_count:2175, hits:0
            })
        });
        describe('request100Streams', function() {
            it('should return an object', async function() {
                expect(await MonitorTwitchChat.request100Streams()).to.be.an('object');
            });
            it('should return an object with the keys data and pagination', async function() {
                expect(await MonitorTwitchChat.request100Streams()).to.include.all.keys('data','pagination')
            });
            it('should return an object with with a key called data that is an array', async function() {
                const result = await MonitorTwitchChat.request100Streams();
                expect(result).to.include.all.keys('data')
                expect(result.data).to.be.an('array');
            });
            it('should return an object with with a key called pagination that is an object', async function() {
                const result = await MonitorTwitchChat.request100Streams();
                expect(result).to.include.all.keys('pagination')
                expect(result.pagination).to.be.an('object');
            });
            it('should return with data from helix-streams-pagination if supplied with a valid pagination value', async function() {
                const result = await MonitorTwitchChat.request100Streams("eyJiIjp7IkN1cn" +
                    "NvciI6ImV5SnpJam8wT1RJM05pNDBPVGc0TlRreU5UYzFOVFFzSW1RaU9tWmhiSE5sT" +
                    "ENKMElqcDBjblZsZlE9PSJ9LCJhIjp7IkN1cnNvciI6ImV5SnpJam96TnpjMUxqRXdN" +
                    "akE1TURrME9USTNPU3dpWkNJNlptRnNjMlVzSW5RaU9uUnlkV1Y5In19");
                expect(result.data[0].user_name).to.have.string('lestream');
            });
        });
    });
    describe('updateStreamList', function() {
        it('should update streamList', async function() {
            expect(MonitorTwitchChat.getStreamList()).to.be.empty;
            await MonitorTwitchChat.updateStreamList();
            expect(MonitorTwitchChat.getStreamList()).to.not.be.empty;
        });
        it('should update streamList to an array that contains objects of user_name, viewer_count and hits', async function() {
            expect(MonitorTwitchChat.getStreamList()).to.be.empty;
            await MonitorTwitchChat.updateStreamList();
            expect(MonitorTwitchChat.getStreamList()).to.be.an('array');
            expect(MonitorTwitchChat.getStreamList()[0]).to.be.an('object').that.includes.all.keys('user_name','viewer_count','hits');
        });
        it('should return with data from helix-stream', async function() {
            await MonitorTwitchChat.updateStreamList();
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"kyle", viewer_count:7851, hits:0
            })
        });
        it('should return with data from helix-stream-pagination', async function() {
            await MonitorTwitchChat.updateStreamList();
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"saiiren", viewer_count:2175, hits:0
            })
        });
    });
    describe('onMessageHandler', function() {
        it('should increase the specified channels hits by 1 when called once', async function() {
            await MonitorTwitchChat.updateStreamList();
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"kyle", viewer_count:7851, hits:0
            })
            MonitorTwitchChat.onMessageHandler('KYLE', {}, 'LULW', false);
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"kyle", viewer_count:7851, hits:1
            })
        });
        it('should not increase the specified channels hits by 1 when message is not valid', async function() {
            await MonitorTwitchChat.updateStreamList();
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"kyle", viewer_count:7851, hits:0
            })
            MonitorTwitchChat.onMessageHandler('KYLE', {}, 'Kappa', false);
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"kyle", viewer_count:7851, hits:0
            })
        });
        it('should increase the specified channels hits by 1 every time it is called', async function() {
            await MonitorTwitchChat.updateStreamList();
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"saiiren", viewer_count:2175, hits:0
            })

            const hitCount = 200;
            for (let i = 0; i < hitCount; i++){
                MonitorTwitchChat.onMessageHandler('Saiiren', {}, 'OMEGALUL', false);
            }
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"saiiren", viewer_count:2175, hits:hitCount
            })
        });
    });
    describe('resetStreamer', function() {
        it('should reset a channels hits to 0', async function() {
            await MonitorTwitchChat.updateStreamList();
            for (let i = 0; i < 565; i++){
                MonitorTwitchChat.onMessageHandler('NymN', {}, 'LULW', false);
            }

            MonitorTwitchChat.resetStreamer("Nymn");
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"nymn", viewer_count:3532, hits:0
            })
        });
        it('should not reset every channels hits to 0', async function() {
            await MonitorTwitchChat.updateStreamList();
            for (let i = 0; i < 565; i++){
                MonitorTwitchChat.onMessageHandler('NymN', {}, 'LULW', false);
            }
            const hitCount = 200;
            for (let i = 0; i < hitCount; i++){
                MonitorTwitchChat.onMessageHandler('saiiren', {}, 'LULW', false);
            }

            MonitorTwitchChat.resetStreamer("Nymn");
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"nymn", viewer_count:3532, hits:0
            })
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"saiiren", viewer_count:2175, hits:hitCount
            })
        });
    });
    describe('resetAllStreamers', function() {
        it('should reset every channels hits to 0', async function() {
            await MonitorTwitchChat.updateStreamList();
            for (let i = 0; i < 565; i++){
                MonitorTwitchChat.onMessageHandler('NymN', {}, 'LULW', false);
            }
            for (let i = 0; i < 200; i++){
                MonitorTwitchChat.onMessageHandler('saiiren', {}, 'LULW', false);
            }
            for (let i = 0; i < 5; i++){
                MonitorTwitchChat.onMessageHandler('kyle', {}, 'OMEGALUL', false);
            }

            MonitorTwitchChat.resetAllStreamers();
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"nymn", viewer_count:3532, hits:0
            })
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"saiiren", viewer_count:2175, hits:0
            })
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"kyle", viewer_count:7851, hits:0
            })
        });
    });
    describe('getStreamerIndex', function() {
        it('should return a streamers index in streamList', async function() {
            await MonitorTwitchChat.updateStreamList();

            expect(MonitorTwitchChat.getStreamerIndex("AsmongolD")).to.equal(0);
            expect(MonitorTwitchChat.getStreamerIndex("cloakzy")).to.equal(9);
            expect(MonitorTwitchChat.getStreamerIndex("BarbarOUSKing")).to.equal(98);
        });
    });
});