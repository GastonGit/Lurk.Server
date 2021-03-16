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
        it('should throw if used with undefined argument', function() {
            expect(MonitorTwitchChat.updateStreamList).to.throw();
        });
        it('should throw if used with an empty object argument', function() {
            expect(function(){MonitorTwitchChat.updateStreamList({})}).to.throw();
        });
        it('should throw if object argument does not contain a data key', function() {
            expect(function(){MonitorTwitchChat.updateStreamList({"test":[{}]})}).to.throw();
        });
        it('should not throw if used with an object argument that contains a data key', function() {
            expect(function(){MonitorTwitchChat.updateStreamList({"data":[{}]})}).to.not.throw();
        });
        it('should not throw if used with valid object argument', function() {
            expect(function(){MonitorTwitchChat.updateStreamList({
                "data": [
                    {
                        "user_name": "moonmoon",
                        "viewer_count": 69
                    }
                ]
            })}).to.not.throw();
        });
        it('should update streamList if used with valid object argument', function() {
            expect(MonitorTwitchChat.getStreamList()).to.be.empty;

            MonitorTwitchChat.updateStreamList({
                "data": [
                    {
                        "user_name": "moonmoon",
                        "viewer_count": 69
                    }
                ]
            })

            expect(MonitorTwitchChat.getStreamList()).to.deep.include(
                {
                "user_name": "moonmoon",
                "viewer_count": 69
                }
            )
        });

    });
});