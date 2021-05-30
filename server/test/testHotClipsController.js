const chai = require('chai')
const spies = require('chai-spies');
const chai_as_promised = require('chai-as-promised')
chai.use(spies);
chai.use(chai_as_promised);
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

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
        process.env.NODE_ENV='test';
        HotClipsController = new HotClipsControllerClass();
        delete process.env.NODE_ENV;
    })
    describe('MonitorTwitchChat', function() {
        it('should be a MonitorTwitchChat class', function() {
            process.env.NODE_ENV='test';
            const HotClipsControllerRealRequire = require('../lib/HotClipsController');
            let HotClipsControllerInner = new HotClipsControllerRealRequire();
            expect(HotClipsControllerInner.monitorTwitchChat).to.be.an.instanceOf(MonitorTwitchChatClass);
            delete process.env.NODE_ENV;
        });
    });
    describe('setupConnection', function() {
        it('should resolve', async function() {
            return (HotClipsController.setupConnection()).should.be.fulfilled;
        });
    });
    describe('start', function() {
        it('should not throw', function(done) {
            expect(function (){HotClipsController.start()}).to.not.throw();
            HotClipsController.endAllMonitorTimers();
            clearInterval(HotClipsController.updateTimer);
            done()
        });
        it('should call startMonitorTimers', function(done) {
            chai.spy.on(HotClipsController, 'startMonitorTimers');
            expect(HotClipsController.startMonitorTimers).to.be.spy;

            HotClipsController.start();

            let checkExpect = function(){
                expect(HotClipsController.startMonitorTimers).to.have.been.called();
                HotClipsController.endAllMonitorTimers();
                clearInterval(HotClipsController.updateTimer);
                done();
            }

            setTimeout(checkExpect, 50);
        });
        it('should call updateChannels', function(done) {
            chai.spy.on(HotClipsController, 'updateChannels');
            expect(HotClipsController.updateChannels).to.be.spy;

            HotClipsController.start();

            let checkExpect = function(){
                expect(HotClipsController.updateChannels).to.have.been.called();
                HotClipsController.endAllMonitorTimers();
                clearInterval(HotClipsController.updateTimer);
                done();
            }

            setTimeout(checkExpect, 15);
        });
    });
    describe('startMonitorTimers', function() {
        it('should not throw', function() {
            expect(function (){HotClipsController.startMonitorTimers()}).to.not.throw();
            HotClipsController.endAllMonitorTimers();
        });
        it('should call checkForSpikes', function(done) {
            chai.spy.on(HotClipsController, 'checkForSpikes');
            expect(HotClipsController.checkForSpikes).to.be.spy;

            HotClipsController.startMonitorTimers();

            let checkExpect = function(){
                expect(HotClipsController.checkForSpikes).to.have.been.called();
                HotClipsController.endAllMonitorTimers();
                done();
            }

            setTimeout(checkExpect, 200);
        });
        it('should call MonitorTwitchChat.decreaseHits', function(done) {
            chai.spy.on(HotClipsController.monitorTwitchChat, 'decreaseHits');
            expect(HotClipsController.monitorTwitchChat.decreaseHits).to.be.spy;

            HotClipsController.startMonitorTimers();

            let checkExpect = function(){
                expect(HotClipsController.monitorTwitchChat.decreaseHits).to.have.been.called();
                HotClipsController.endAllMonitorTimers();
                done();
            }

            setTimeout(checkExpect, 200);
        });
    });
    describe('checkForSpikes', function() {
        it('should take an int argument', function() {
            expect(function (){HotClipsController.checkForSpikes()}).to.throw();
            expect(function (){HotClipsController.checkForSpikes('test')}).to.throw();
            expect(function (){HotClipsController.checkForSpikes(123)}).to.not.throw();
        });
        it('should not clip for streamers with a cooldown', function() {
            process.env.NODE_ENV='test';
            let monitorTwitchChatStubInner = class {
                constructor(){

                }
                getStreamList(){
                    return [
                        {user_name:"nymn", viewer_count:0, hits:5, cooldown: true},
                        {user_name:"forsen", viewer_count:45, hits:50,  cooldown: true},
                    ];
                }
            }
            const HotClipsControllerClassInner = proxyquire('../lib/HotClipsController',{
                './ClipList':clipListStub,
                './MonitorTwitchChat':monitorTwitchChatStubInner,
                './TwitchClient':twitchClientStub,
                './Clipper': clipperStub
            });
            let HotClipsControllerInner = new HotClipsControllerClassInner();

            chai.spy.on(HotClipsControllerInner, 'clipIt');
            expect(HotClipsControllerInner.clipIt).to.be.spy;

            HotClipsControllerInner.checkForSpikes(45);

            expect(HotClipsControllerInner.clipIt).to.have.been.called.exactly(0);
            delete process.env.NODE_ENV;
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
            process.env.NODE_ENV = 'test';
            let clipperStubInner = class {
                constructor(){

                }
                createClip(){

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
            delete process.env.NODE_ENV;
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
    describe('cooldownStreamer', function() {
        it('should take a string argument', function() {
            expect(function (){HotClipsController.cooldownStreamer()}).to.throw();
            expect(function (){HotClipsController.cooldownStreamer(123)}).to.throw();
            expect(function (){HotClipsController.cooldownStreamer('test')}).to.not.throw();
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
        it('should call delayAddingClip if clip has been created', async function() {
            chai.spy.on(HotClipsController, 'delayAddingClip');
            expect(HotClipsController.delayAddingClip).to.be.spy;

            await HotClipsController.clipIt('moonmoon');

            expect(HotClipsController.delayAddingClip).to.have.been.called()
        });
        it('should not call delayAddingClip if clip has not been created', async function() {
            process.env.NODE_ENV='test';
            class clipperStubInner {
                createClip(){
                    return {created:false,data:{id: 'SpunkySecretiveOrangeShadyLulu-KCNPm3bm3KTbuOCl'}};
                }
            }
            const HotClipsControllerClassInner = proxyquire('../lib/HotClipsController',{
                './ClipList':clipListStub,
                './MonitorTwitchChat':monitorTwitchChatStub,
                './TwitchClient':twitchClientStub,
                './Clipper': clipperStubInner
            });
            let HotClipsControllerInner = new HotClipsControllerClassInner();

            chai.spy.on(HotClipsControllerInner, 'delayAddingClip');
            expect(HotClipsControllerInner.delayAddingClip).to.be.spy;

            await HotClipsControllerInner.clipIt('moonmoon');

            expect(HotClipsControllerInner.delayAddingClip).to.not.have.been.called()
            delete process.env.NODE_ENV;
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
    describe('delayAddingClip', function() {
        it('should call addClip if videoURL is valid', function(done) {
            chai.spy.on(HotClipsController, 'addClip');
            expect(HotClipsController.addClip).to.be.spy;

            HotClipsController.delayAddingClip('twitchClip');

            let checkExpect = function(){
                expect(HotClipsController.addClip).to.have.been.called();
                done();
            }

            setTimeout(checkExpect, 50);
        });
        it('should call clipList.removeClip if videoURL is valid', function(done) {
            chai.spy.on(HotClipsController.clipList, 'removeClip');
            expect(HotClipsController.clipList.removeClip).to.be.spy;

            HotClipsController.delayAddingClip('twitchClip');

            let checkExpect = function(){
                expect(HotClipsController.clipList.removeClip).to.have.been.called();
                done();
            }

            setTimeout(checkExpect, 500);
        });
        it('should not call addClip if videoURL is not valid', function(done) {
            chai.spy.on(HotClipsController, 'addClip');
            expect(HotClipsController.addClip).to.be.spy;

            HotClipsController.delayAddingClip('MISS');

            let checkExpect = function(){
                expect(HotClipsController.addClip).to.not.have.been.called();
                done();
            }

            setTimeout(checkExpect, 50);
        });
    });
    describe('createClip', function() {
        it('should take a string argument', async function() {
            await expect(HotClipsController.createClip()).to.be.rejectedWith('Argument is undefined');
            await expect(HotClipsController.createClip(123)).to.be.rejectedWith('Argument is not a string');
            await expect(HotClipsController.createClip('test')).to.be.fulfilled;
        });
        it('should return an object', async function() {
            const result = await HotClipsController.createClip('test');
            expect(result).to.be.an('object');
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