const chai = require('chai')
const spies = require('chai-spies');
const chai_as_promised = require('chai-as-promised')
chai.use(spies);
chai.use(chai_as_promised);
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should;

const proxyquire = require('proxyquire');
const clipListStub = require('../stubs/clipListStub');
const monitorTwitchChatStub = require('../stubs/monitorTwitchChatStub');
const twitchClientStub = require('../stubs/twitchClientStub');

const HotClipsControllerClass = proxyquire('../lib/HotClipsController',{
    './ClipList':clipListStub,
    './MonitorTwitchChat':monitorTwitchChatStub,
    './TwitchClient':twitchClientStub
});

let HotClipsController;
let MonitorTwitchChatClass = require('../lib/MonitorTwitchChat');

describe('HotClipsController methods', function() {
    before(function (){
        HotClipsController = new HotClipsControllerClass();
    })
    describe('MonitorTwitchChat', function() {
        it('should be a MonitorTwitchChat class', function() {
            const HotClipsControllerRealRequire = require('../lib/HotClipsController');
            let HotClipsControllerInner = new HotClipsControllerRealRequire();
            expect(HotClipsControllerInner.monitorTwitchChat).to.be.an.instanceOf(MonitorTwitchChatClass);
        });
    });
    describe('setupConnection', function() {
        it('should resolve', async function() {
            return (HotClipsController.setupConnection()).should.be.fulfilled;
        });
    });
    describe('Get list', function() {
        it('should return an array', function() {
            assert.isArray(HotClipsController.getList());
        });
    });
});