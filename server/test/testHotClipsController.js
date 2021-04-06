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
const clipperStub = require('../stubs/clipperStub');

const HotClipsControllerClass = proxyquire('../lib/HotClipsController',{
    './ClipList':clipListStub,
    './MonitorTwitchChat':monitorTwitchChatStub,
    './TwitchClient':twitchClientStub,
    './Clipper': clipperStub
});

let HotClipsController;
let MonitorTwitchChatClass = require('../lib/MonitorTwitchChat');

describe('HotClipsController methods', function() {
    beforeEach(function (){
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
        it('should call clipIt when a spike is found', function() {
            chai.spy.on(HotClipsController, 'clipIt');
            expect(HotClipsController.clipIt).to.be.spy;

            HotClipsController.checkForSpikes(99);

            expect(HotClipsController.clipIt).to.have.been.called();
        });
        it('should call clipIt when everytime a spike is found', function() {
            chai.spy.on(HotClipsController, 'clipIt');
            expect(HotClipsController.clipIt).to.be.spy;

            HotClipsController.checkForSpikes(45);

            expect(HotClipsController.clipIt).to.have.been.called.exactly(3);
        });
        it('should catch errors from clipIt', function() {
            let clipperStubInner = class {
                constructor(){

                }
                async createClip(){

                }
            }
            const HotClipsControllerClassInner = proxyquire('../lib/HotClipsController',{
                './ClipList':clipListStub,
                './MonitorTwitchChat':monitorTwitchChatStub,
                './TwitchClient':twitchClientStub,
                './Clipper': clipperStubInner
            });
            let HotClipsControllerInner = new HotClipsControllerClassInner();

            expect(function (){HotClipsControllerInner.checkForSpikes(35)}).to.not.throw();
        });
    });
    describe('getStreamList', function() {
        it('should return an array', function() {
            expect(HotClipsController.getStreamList()).to.be.an('array');
        });
        it('should call MonitorTwitchChat.getStreamList', function() {
            chai.spy.on(HotClipsController.monitorTwitchChat, 'getStreamList');
            expect(HotClipsController.monitorTwitchChat.getStreamList).to.be.spy;

            HotClipsController.getStreamList();

            expect(HotClipsController.monitorTwitchChat.getStreamList).to.have.been.called();
        });
    });
    describe('clipIt', function() {
        it('should take a string argument', async function() {
            await expect(HotClipsController.clipIt()).to.be.rejectedWith('Argument is undefined');
            await expect(HotClipsController.clipIt(123)).to.be.rejectedWith('Argument is not a string');
            await expect(HotClipsController.clipIt('test')).to.be.fulfilled;
        });
        it('should call resetHits', function() {
            chai.spy.on(HotClipsController, 'resetHits');
            expect(HotClipsController.resetHits).to.be.spy;

            HotClipsController.clipIt('moonmoon');

            expect(HotClipsController.resetHits).to.have.been.called();
        });
        it('should call createClip', function() {
            chai.spy.on(HotClipsController, 'createClip');
            expect(HotClipsController.createClip).to.be.spy;

            HotClipsController.clipIt('moonmoon');

            expect(HotClipsController.createClip).to.have.been.called();
        });
        it('should call addClip', async function() {
            chai.spy.on(HotClipsController, 'addClip');
            expect(HotClipsController.addClip).to.be.spy;

            await HotClipsController.clipIt('moonmoon');

            expect(HotClipsController.addClip).to.have.been.called();
        });
    });
    describe('addClip', function() {
        it('should take a string argument', function() {
            expect(function (){HotClipsController.addClip()}).to.throw();
            expect(function (){HotClipsController.addClip(123)}).to.throw();
            expect(function (){HotClipsController.addClip('test')}).to.not.throw();
        });
        it('should call clipList.addClip', function() {
            chai.spy.on(HotClipsController.clipList, 'addClip');
            expect(HotClipsController.clipList.addClip).to.be.spy;

            HotClipsController.addClip('twitchClip');

            expect(HotClipsController.clipList.addClip).to.have.been.called();
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
        it('should call Clipper.createClip', async function() {
            chai.spy.on(HotClipsController.clipper, 'createClip');
            expect(HotClipsController.clipper.createClip).to.be.spy;

            HotClipsController.createClip('twitchClip');

            expect(HotClipsController.clipper.createClip).to.have.been.called();
        });
    });
    describe('resetHits', function() {
        it('should take a string argument', function() {
            expect(function (){HotClipsController.resetHits()}).to.throw();
            expect(function (){HotClipsController.resetHits(123)}).to.throw();
            expect(function (){HotClipsController.resetHits('test')}).to.not.throw();
        });
        it('should call MonitorTwitchChat.resetStreamer', function() {
            chai.spy.on(HotClipsController.monitorTwitchChat, 'resetStreamer');
            expect(HotClipsController.monitorTwitchChat.resetStreamer).to.be.spy;

            HotClipsController.resetHits('moonmoon');

            expect(HotClipsController.monitorTwitchChat.resetStreamer).to.have.been.called();
        });
    });
    describe('Get list', function() {
        it('should return an array', function() {
            assert.isArray(HotClipsController.getList());
        });
    });
});