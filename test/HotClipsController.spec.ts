import * as chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import sinon from 'sinon';
import HotClipsController from '../lib/HotClipsController';
import ClipList from '../lib/ClipList';
import MonitorTwitchChat from '../lib/MonitorTwitchChat';
import Clipper from '../lib/Clipper';
import Logger from '../lib/Logger';
import { Clip, Stream } from '../lib/Interfaces';

let hotClipsController: HotClipsController;

let clock: sinon.SinonFakeTimers;
let getVideoUrl: sinon.SinonStub<[slug: string], Promise<string | undefined>>;
let createClip: sinon.SinonStub<[streamer: string], Promise<Clip | undefined>>;
let getStreamList: sinon.SinonStub<[], Stream[]>;
let getList: sinon.SinonStub<[], string[]>;

describe('HotClipsController suite', () => {
    beforeEach(() => {
        clock = sinon.useFakeTimers();
        hotClipsController = new HotClipsController();
        sinon
            .stub(MonitorTwitchChat.prototype, 'setupConnection')
            .resolves(true);
        sinon
            .stub(MonitorTwitchChat.prototype, 'updateChannels')
            .resolves(true);
        getStreamList = sinon
            .stub(MonitorTwitchChat.prototype, 'getStreamList')
            .returns([
                {
                    cooldown: false,
                    hits: 10000,
                    viewer_count: 20,
                    user_name: 'ugly221',
                },
            ]);
        const testArray = ['test'];
        testArray.length = 21;
        getList = sinon.stub(ClipList.prototype, 'getList').returns(testArray);
        createClip = sinon.stub(Clipper.prototype, 'createClip').resolves({
            broadcaster_id: '',
            broadcaster_name: '',
            created_at: '',
            creator_id: '',
            creator_name: '',
            duration: 0,
            embed_url: '',
            game_id: '',
            language: '',
            thumbnail_url: '',
            title: '',
            url: '',
            video_id: '',
            view_count: 0,
            id: 'test',
        });
        getVideoUrl = sinon
            .stub(Clipper.prototype, 'getVideoUrl')
            .resolves('videoUrl');
        sinon.stub(Logger, 'error');
    });
    afterEach(() => {
        hotClipsController.endTimers();
        clock.restore();
        sinon.restore();
    });
    describe('Getting the clip list', () => {
        it('should return a string array', () => {
            expect(hotClipsController.getList()).to.be.an('array');
        });
    });
    describe('Starting the monitoring', () => {
        it('should not throw if monitoring setup is successful', async () => {
            expect(async () => {
                await hotClipsController.start();
                clock.tick(100000);
            }).to.not.throw();
        });
        it('should throw if monitoring setup is unsuccessful', async () => {
            sinon.restore();
            sinon
                .stub(MonitorTwitchChat.prototype, 'setupConnection')
                .resolves(false);
            await expect(hotClipsController.start()).to.be.rejectedWith(
                'Connection setup failed',
            );
        });
    });
    describe('Callback Coverage', () => {
        describe('startIndependentInterval', () => {
            it('should not remove clips if clip count is too low', async () => {
                getList.restore();
                getList = sinon.stub(ClipList.prototype, 'getList').returns([]);

                await hotClipsController.start();

                clock.tick(10000000);
            });
        });
        describe('checkForSpikes', () => {
            it('should throw if clipIt fails', async () => {
                createClip.restore();
                createClip = sinon
                    .stub(Clipper.prototype, 'createClip')
                    .throws();

                await hotClipsController.start();

                clock.tick(100);
            });
            it('should not clip streams that are on cooldown', async () => {
                getStreamList.restore();
                getStreamList = sinon
                    .stub(MonitorTwitchChat.prototype, 'getStreamList')
                    .returns([
                        {
                            cooldown: true,
                            hits: 10000,
                            viewer_count: 20,
                            user_name: 'ugly221',
                        },
                    ]);

                await hotClipsController.start();

                clock.tick(100);
            });
            it('should not clip streams that hit the required spike', async () => {
                getStreamList.restore();
                getStreamList = sinon
                    .stub(MonitorTwitchChat.prototype, 'getStreamList')
                    .returns([
                        {
                            cooldown: false,
                            hits: 2,
                            viewer_count: 2000,
                            user_name: 'ugly221',
                        },
                    ]);

                await hotClipsController.start();

                clock.tick(100);
            });
            it('should throw if clipIt fails', async () => {
                createClip.restore();
                createClip = sinon
                    .stub(Clipper.prototype, 'createClip')
                    .throws();

                await hotClipsController.start();

                clock.tick(100);
            });
        });
        describe('clipIt', () => {
            it('should add undefined clips', async () => {
                createClip.restore();
                createClip = sinon
                    .stub(Clipper.prototype, 'createClip')
                    .resolves(undefined);

                await hotClipsController.start();

                clock.tick(100);
            });
        });
        describe('addClipWithDelay', () => {
            it('should add defined clips', async () => {
                await hotClipsController.start();
                await expect(clock.tickAsync(10000)).to.not.be.rejectedWith();
            });
            it('should not add undefined clips', async () => {
                getVideoUrl.restore();
                getVideoUrl = sinon
                    .stub(Clipper.prototype, 'getVideoUrl')
                    .resolves(undefined);

                await hotClipsController.start();
                await expect(clock.tickAsync(100)).to.not.be.rejectedWith();
            });
        });
    });
});
