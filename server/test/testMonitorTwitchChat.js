const chai = require('chai')
const spies = require('chai-spies');
const chai_as_promised = require('chai-as-promised')
chai.use(spies);
chai.use(chai_as_promised);
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const proxyquire = require('proxyquire');
const fetchStub = require('../stubs/fetchStub');
const twitchClientClass = require('../stubs/twitchClientStub');
let twitchClient

let MonitorTwitchChatClass = proxyquire('../lib/MonitorTwitchChat', {'node-fetch':fetchStub});
let MonitorTwitchChat;

const validMessages = [
    'LUL',
    'LULW',
    'OMEGALUL',
    'LuL'
];

describe('MonitorTwitchChat methods', function() {
    beforeEach(function (){
        twitchClient = new twitchClientClass();
        MonitorTwitchChat = new MonitorTwitchChatClass(
            twitchClient, {
                requestCount: 2,
                validMessages:validMessages
        });
    })
    describe('constructor', function() {
        it('should set requestCount to specified when specified', function() {
            const count = 5;
            MonitorTwitchChat = new MonitorTwitchChatClass(
                twitchClient, {
                requestCount: count
            });
            expect(MonitorTwitchChat.requestCount).to.equal(count);
        });
        it('should set requestCount to 1 when not specified', function() {
            MonitorTwitchChat = new MonitorTwitchChatClass(
                twitchClient, {});
            expect(MonitorTwitchChat.requestCount).to.equal(1);
        });
        it('should set validMessages to specified when specified', function() {
            const validMessages = [
                'LUL',
                'LULW',
                'LuL'
            ];
            MonitorTwitchChat = new MonitorTwitchChatClass(
                twitchClient, {
                    validMessages: validMessages
                });
            expect(MonitorTwitchChat.validMessages).to.equal(validMessages);
        });
        it('should set validMessages to "OMEGALUL" when not specified', function() {
            MonitorTwitchChat = new MonitorTwitchChatClass(
                twitchClient, {});
            expect(MonitorTwitchChat.validMessages).to.deep.equal(['OMEGALUL']);
        });
    });
    describe('getStreamList', function() {
        it('should return an empty array', function() {
            expect(MonitorTwitchChat.getStreamList()).to.be.an('array').that.is.empty;
        });
    });
    describe('requestStreams', async function() {
        const result = await MonitorTwitchChat.requestStreams();
        it('should return an array that is not empty', async function() {
            expect(result).to.be.an('array').to.be.an('array').that.is.not.empty;
        });
        it('should return an array that contains objects with the keys user_name, viewer_count and hits', async function() {
            expect(result[0]).to.be.an('object').that.includes.all.keys('user_name','viewer_count','hits');
        });
        it('should return an array that contain objects with string key user_name', async function() {
            assert.isString(result[0].user_name);
        });
        it('should return an array that contain objects with number key viewer_count', async function() {
            assert.isNumber(result[0].viewer_count);
        });
        it('should return an array that contain objects with number key hits', async function() {
            assert.isNumber(result[0].hits);
        });
        it('should return with data from helix-stream', async function() {
            expect(result).to.deep.include({
                user_name:"kyle", viewer_count:7851, hits:0
            })
        });
        it('should return with data from helix-stream-pagination', async function() {
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
                expect(result).to.include.keys('data')
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
        beforeEach(function (){
            expect(MonitorTwitchChat.getStreamList()).to.be.empty;
        })
        it('should add elements to streamList', async function() {
            await MonitorTwitchChat.updateStreamList();
            expect(MonitorTwitchChat.getStreamList()).to.not.be.empty;
        });
        it('should update streamList to an array that contains objects of user_name, viewer_count and hits', async function() {
            await MonitorTwitchChat.updateStreamList();
            expect(MonitorTwitchChat.getStreamList()).to.be.an('array');
            expect(MonitorTwitchChat.getStreamList()[0]).to.be.an('object').that.includes.all.keys('user_name','viewer_count','hits');
        });
        it('should return with data from helix-stream', async function() {
            await MonitorTwitchChat.updateStreamList();
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"kyle", viewer_count:7851, hits:0, cooldown:false
            })
        });
        it('should return with data from helix-stream-pagination', async function() {
            await MonitorTwitchChat.updateStreamList();
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"saiiren", viewer_count:2175, hits:0, cooldown:false
            })
        });
    });
    describe('onMessageHandler', function() {
        beforeEach(async function(){
            await MonitorTwitchChat.updateStreamList();
        })
        it('should increase the specified channels hits by 1 when called once', async function() {
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"kyle", viewer_count:7851, hits:0, cooldown:false
            })
            MonitorTwitchChat.onMessageHandler('KYLE', {}, validMessages[1], false);
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"kyle", viewer_count:7851, hits:1, cooldown:false
            })
        });
        it('should not increase the specified channels hits by 1 when message is not valid', async function() {
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"kyle", viewer_count:7851, hits:0, cooldown:false
            })
            MonitorTwitchChat.onMessageHandler('KYLE', {}, 'Kappa', false);
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"kyle", viewer_count:7851, hits:0, cooldown:false
            })
        });
        it('should increase the specified channels hits by 1 every time it is called', async function() {
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"saiiren", viewer_count:2175, hits:0, cooldown:false
            })
            const hitCount = 200;
            for (let i = 0; i < hitCount; i++){
                MonitorTwitchChat.onMessageHandler('Saiiren', {}, validMessages[2], false);
            }
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"saiiren", viewer_count:2175, hits:hitCount, cooldown:false
            })
        });
    });
    describe('resetStreamer', function() {
        beforeEach(async function(){
            await MonitorTwitchChat.updateStreamList();
        })
        it('should reset a channels hits to 0', async function() {
            for (let i = 0; i < 565; i++){
                MonitorTwitchChat.onMessageHandler('NymN', {}, validMessages[1], false);
            }

            MonitorTwitchChat.resetStreamer("Nymn");
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"nymn", viewer_count:3532, hits:0, cooldown:false
            })
        });
        it('should not reset every channels hits to 0', async function() {
            for (let i = 0; i < 565; i++){
                MonitorTwitchChat.onMessageHandler('NymN', {}, validMessages[1], false);
            }
            const hitCount = 200;
            for (let i = 0; i < hitCount; i++){
                MonitorTwitchChat.onMessageHandler('saiiren', {}, validMessages[1], false);
            }

            MonitorTwitchChat.resetStreamer("Nymn");
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"nymn", viewer_count:3532, hits:0, cooldown:false
            })
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"saiiren", viewer_count:2175, hits:hitCount, cooldown:false
            })
        });
    });
    describe('resetAllStreamers', function() {
        it('should reset every channels hits to 0', async function() {
            await MonitorTwitchChat.updateStreamList();
            for (let i = 0; i < 565; i++){
                MonitorTwitchChat.onMessageHandler('NymN', {}, validMessages[1], false);
            }
            for (let i = 0; i < 200; i++){
                MonitorTwitchChat.onMessageHandler('saiiren', {}, validMessages[1], false);
            }
            for (let i = 0; i < 5; i++){
                MonitorTwitchChat.onMessageHandler('kyle', {}, validMessages[2], false);
            }

            MonitorTwitchChat.resetAllStreamers();
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"nymn", viewer_count:3532, hits:0, cooldown:false
            })
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"saiiren", viewer_count:2175, hits:0, cooldown:false
            })
            expect(MonitorTwitchChat.getStreamList()).to.deep.include({
                user_name:"kyle", viewer_count:7851, hits:0, cooldown:false
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
    describe('getCompactStreamList', function() {
        it('should return an array', async function() {
            expect(MonitorTwitchChat.getCompactStreamList()).to.be.an('array');
        });
    });
    describe('cooldownStreamer', function() {
        it('should take a string and an int', async function() {
            await MonitorTwitchChat.updateStreamList();

            expect(function (){MonitorTwitchChat.cooldownStreamer()}).to.throw();
            expect(function (){MonitorTwitchChat.cooldownStreamer('kyle')}).to.throw();
            expect(function (){MonitorTwitchChat.cooldownStreamer(0)}).to.throw();
            expect(function (){MonitorTwitchChat.cooldownStreamer('kyle', 'test')}).to.throw();
            expect(function (){MonitorTwitchChat.cooldownStreamer(0, 0)}).to.throw();
            expect(function (){MonitorTwitchChat.cooldownStreamer('kyle',0)}).to.not.throw();
        });
        it('should set the cooldown for the streamer to true', async function() {
            await MonitorTwitchChat.updateStreamList();

            const streamer = 'kyle'
            MonitorTwitchChat.cooldownStreamer(streamer,0);

            expect(MonitorTwitchChat.getStreamList()[MonitorTwitchChat.getStreamerIndex(streamer)].cooldown)
                .to.equal(true);
        });
    });
    describe('removeCooldownForStreamer', function() {
        it('should take a string argument', async function() {
            await MonitorTwitchChat.updateStreamList();

            expect(function (){MonitorTwitchChat.removeCooldownForStreamer()}).to.throw();
            expect(function (){MonitorTwitchChat.removeCooldownForStreamer(0)}).to.throw();
            expect(function (){MonitorTwitchChat.removeCooldownForStreamer('kyle')}).to.not.throw();
        });
        it('should set the cooldown for the streamer to false', async function() {
            await MonitorTwitchChat.updateStreamList();

            const streamer = 'kyle'
            MonitorTwitchChat.removeCooldownForStreamer(streamer);

            expect(MonitorTwitchChat.getStreamList()[MonitorTwitchChat.getStreamerIndex(streamer)].cooldown)
                .to.equal(false);
        });
    });
    describe('setCompactStreamList', function() {
        it('should set compactStreamList to contain channel user names', async function() {
            await MonitorTwitchChat.updateStreamList();

            MonitorTwitchChat.setCompactStreamList();
            const list = MonitorTwitchChat.getCompactStreamList();

            expect(list).to.include('asmongold');
            expect(list).to.include('cloakzy');
            expect(list).to.include('saiiren');
        });
    });
    describe('joinChannels', function() {
        it('should not throw', async function() {
            await MonitorTwitchChat.updateStreamList();
            return (MonitorTwitchChat.joinChannels()).should.be.fulfilled;
        });
    });
    describe('connectToTwitch', function() {
        it('should be resolved', async function() {
            return (MonitorTwitchChat.connectToTwitch()).should.be.fulfilled;
        });
    });
    describe('decreaseHits', function() {
        it('should throw without an argument', function() {
            expect(function(){MonitorTwitchChat.decreaseHits()}).to.throw();
        });
        it('should take a number as an argument', function() {
            expect(function(){MonitorTwitchChat.decreaseHits(123)}).to.not.throw();
            expect(function(){MonitorTwitchChat.decreaseHits('string')}).to.throw();
            expect(function(){MonitorTwitchChat.decreaseHits(NaN)}).to.throw();
        });
        it('should reduce streamer hits by x when called', function() {
            MonitorTwitchChat.streamList = [
                {user_name: 'kyle', viewer_count: 123, hits: 50},
                {user_name: 'moonmoon', viewer_count: 54, hits: 62},
                {user_name: 'nymn', viewer_count: 78, hits: 13},
                {user_name: 'forsen', viewer_count: 678, hits: 30},
                {user_name: 'sodapoppin', viewer_count: 1233, hits: 10}
            ]
            MonitorTwitchChat.decreaseHits(1);
            expect(MonitorTwitchChat.getStreamList()[0].hits).to.equal(49);
            expect(MonitorTwitchChat.getStreamList()[1].hits).to.equal(61);
            expect(MonitorTwitchChat.getStreamList()[2].hits).to.equal(12);
            expect(MonitorTwitchChat.getStreamList()[3].hits).to.equal(29);
            expect(MonitorTwitchChat.getStreamList()[4].hits).to.equal(9);

            MonitorTwitchChat.decreaseHits(3);
            expect(MonitorTwitchChat.getStreamList()[0].hits).to.equal(46);
            expect(MonitorTwitchChat.getStreamList()[1].hits).to.equal(58);
            expect(MonitorTwitchChat.getStreamList()[2].hits).to.equal(9);
            expect(MonitorTwitchChat.getStreamList()[3].hits).to.equal(26);
            expect(MonitorTwitchChat.getStreamList()[4].hits).to.equal(6);
        });
        it('should not reduce streamer hits below 0', function() {
            MonitorTwitchChat.streamList = [
                {user_name: 'kyle', viewer_count: 123, hits: 50},
                {user_name: 'moonmoon', viewer_count: 54, hits: 62},
                {user_name: 'nymn', viewer_count: 78, hits: 13},
                {user_name: 'forsen', viewer_count: 678, hits: 30},
                {user_name: 'sodapoppin', viewer_count: 1233, hits: 10}
            ]

            MonitorTwitchChat.decreaseHits(11);
            expect(MonitorTwitchChat.getStreamList()[4].hits).to.equal(0);

            MonitorTwitchChat.decreaseHits(100);
            expect(MonitorTwitchChat.getStreamList()[0].hits).to.equal(0);
            expect(MonitorTwitchChat.getStreamList()[1].hits).to.equal(0);
            expect(MonitorTwitchChat.getStreamList()[2].hits).to.equal(0);
            expect(MonitorTwitchChat.getStreamList()[3].hits).to.equal(0);
            expect(MonitorTwitchChat.getStreamList()[4].hits).to.equal(0);
        });
    });
});