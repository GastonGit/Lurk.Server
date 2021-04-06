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
    describe('start', function() {
        it('should not throw', function() {
            expect(function (){HotClipsController.start()}).to.not.throw();
            HotClipsController.endTimer();
        });
        it('should call checkForSpikes', function(done) {
            chai.spy.on(HotClipsController, 'checkForSpikes');
            expect(HotClipsController.checkForSpikes).to.be.spy;

            HotClipsController.start();

            let checkExpect = function(){
                expect(HotClipsController.checkForSpikes).to.have.been.called();
                HotClipsController.endTimer();
                done();
            }

            setTimeout(checkExpect, 1000);
        });
    });
    describe('checkForSpikes', function() {
        it('should take an int argument', function() {
            expect(function (){HotClipsController.checkForSpikes()}).to.throw();
            expect(function (){HotClipsController.checkForSpikes('test')}).to.throw();
            expect(function (){HotClipsController.checkForSpikes(123)}).to.not.throw();
        });
        it('should call getStreamList', function() {
            chai.spy.on(HotClipsController, 'getStreamList');
            expect(HotClipsController.getStreamList).to.be.spy;

            HotClipsController.checkForSpikes(3);

            expect(HotClipsController.getStreamList).to.have.been.called();
        });
    });
    describe('getStreamList', function() {
        it('should return an array', function() {
            expect(HotClipsController.getStreamList()).to.be.an('array');
        });
    });
    describe('clipIt', function() {
        it('should not throw', function() {
            expect(function (){HotClipsController.clipIt()}).to.not.throw();
        });
    });
    describe('addClip', function() {
        it('should take a string argument', function() {
            expect(function (){HotClipsController.addClip()}).to.throw();
            expect(function (){HotClipsController.addClip(123)}).to.throw();
            expect(function (){HotClipsController.addClip('test')}).to.not.throw();
        });
    });
    describe('createClip', function() {
        it('should take a string argument', async function() {
            await expect(HotClipsController.createClip()).to.be.rejectedWith('Argument is undefined');
            await expect(HotClipsController.createClip(123)).to.be.rejectedWith('Argument is not a string');
            await expect(HotClipsController.createClip('test')).to.be.fulfilled;
        });
        it('should return a string', async function() {
            const result = await HotClipsController.createClip('test');
            expect(result).to.be.a('string');
        });
    });
    describe('resetHits', function() {
        it('should take a string argument', function() {
            expect(function (){HotClipsController.resetHits()}).to.throw();
            expect(function (){HotClipsController.resetHits(123)}).to.throw();
            expect(function (){HotClipsController.resetHits('test')}).to.not.throw();
        });
    });
    describe('Get list', function() {
        it('should return an array', function() {
            assert.isArray(HotClipsController.getList());
        });
    });
});