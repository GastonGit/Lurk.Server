import * as chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import sinon from 'sinon';
import HotClipsController from '../lib/HotClipsController';
import ClipList from '../lib/ClipList';
import TwitchSupervisor from '../lib/TwitchSupervisor';
import Logger from '../lib/Logger';
import { Stream } from '../lib/Interfaces';
import EventIntervals from '../lib/EventIntervals';
import Container from '../lib/Container';

let hotClipsController: HotClipsController;

let clock: sinon.SinonFakeTimers;
let getVideoUrl: sinon.SinonStub<[string], Promise<string | null>>;
let createClip: sinon.SinonStub<
    [string],
    Promise<{ id: string; edit_url: string } | null>
>;
let getStreamList: sinon.SinonStub<[], Stream[]>;
let getList: sinon.SinonStub<[], string[]>;

describe('HotClipsController suite', () => {
    beforeEach(() => {
        sinon.stub(Container.prototype, 'updateList').resolves();
        sinon.stub(Container.prototype, 'getList').resolves([]);
        clock = sinon.useFakeTimers();
        hotClipsController = new HotClipsController();
        sinon
            .stub(TwitchSupervisor.prototype, 'setupConnection')
            .resolves(true);
        sinon.stub(TwitchSupervisor.prototype, 'updateChannels').resolves(true);
        getStreamList = sinon
            .stub(TwitchSupervisor.prototype, 'getStreamList')
            .returns([
                {
                    cooldown: false,
                    hits: 10000,
                    viewer_count: 20,
                    user_name: 'ugly221',
                },
            ]);
        sinon
            .stub(EventIntervals.prototype, 'createConstrainedInterval')
            .callsArg(0);
        sinon
            .stub(EventIntervals.prototype, 'startIndependentInterval')
            .callsArg(1);
        sinon.stub(EventIntervals.prototype, 'startSuperInterval').callsArg(0);
        const testArray = ['test'];
        testArray.length = 21;
        getList = sinon.stub(ClipList.prototype, 'getList').returns(testArray);
        createClip = sinon
            .stub(TwitchSupervisor.prototype, 'createClip')
            .resolves({ id: 'ccID', edit_url: 'ccEU' });
        getVideoUrl = sinon
            .stub(TwitchSupervisor.prototype, 'getVideoUrl')
            .resolves('videoUrl');
        sinon.stub(Logger, 'error');
        sinon.stub(Logger, 'info');
    });
    afterEach(() => {
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
            }).to.not.throw();
        });
        it('should throw if monitoring setup is unsuccessful', async () => {
            sinon.restore();
            sinon
                .stub(TwitchSupervisor.prototype, 'setupConnection')
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

                expect(async () => {
                    await hotClipsController.start();
                }).to.not.throw();
            });
        });
        describe('checkForSpikes', () => {
            it('should throw if clipIt fails', async () => {
                createClip.restore();
                createClip = sinon
                    .stub(TwitchSupervisor.prototype, 'createClip')
                    .throws();

                expect(async () => {
                    await hotClipsController.start();
                }).to.not.throw();
                clock.tickAsync(100);
            });
            it('should not clip streams that are on cooldown', async () => {
                getStreamList.restore();
                getStreamList = sinon
                    .stub(TwitchSupervisor.prototype, 'getStreamList')
                    .returns([
                        {
                            cooldown: true,
                            hits: 10000,
                            viewer_count: 20,
                            user_name: 'ugly221',
                        },
                    ]);

                expect(async () => {
                    await hotClipsController.start();
                }).to.not.throw();
            });
            it('should clip streams that hit the required spike', async () => {
                expect(
                    HotClipsController.spikeFound(
                        {
                            cooldown: false,
                            hits: 9,
                            viewer_count: 1556,
                            user_name: 'ugly221',
                        },
                        7,
                    ),
                ).to.be.true;
                expect(
                    HotClipsController.spikeFound(
                        {
                            cooldown: false,
                            hits: 7,
                            viewer_count: 705,
                            user_name: 'ugly221',
                        },
                        7,
                    ),
                ).to.be.true;
                expect(
                    HotClipsController.spikeFound(
                        {
                            cooldown: false,
                            hits: 31,
                            viewer_count: 10763,
                            user_name: 'ugly221',
                        },
                        7,
                    ),
                ).to.be.true;
                expect(
                    HotClipsController.spikeFound(
                        {
                            cooldown: false,
                            hits: 23,
                            viewer_count: 7508,
                            user_name: 'ugly221',
                        },
                        7,
                    ),
                ).to.be.true;
            });
            it('should not clip streams that do not hit the required spike', async () => {
                expect(
                    HotClipsController.spikeFound(
                        {
                            cooldown: false,
                            hits: 35,
                            viewer_count: 73454,
                            user_name: 'ugly221',
                        },
                        7,
                    ),
                ).to.be.false;
                expect(
                    HotClipsController.spikeFound(
                        {
                            cooldown: false,
                            hits: 36,
                            viewer_count: 74943,
                            user_name: 'ugly221',
                        },
                        7,
                    ),
                ).to.be.false;
            });
            it('should throw if clipIt fails', async () => {
                createClip.restore();
                createClip = sinon
                    .stub(TwitchSupervisor.prototype, 'createClip')
                    .throws();

                expect(async () => {
                    await hotClipsController.start();
                }).to.not.throw();
            });
        });
        describe('clipIt', () => {
            it('should not throw if clip creation returns null', async () => {
                createClip.restore();
                createClip = sinon
                    .stub(TwitchSupervisor.prototype, 'createClip')
                    .resolves(null);

                await expect(
                    hotClipsController.start(),
                ).to.not.be.rejectedWith();
                clock.tick(100);
            });
        });
        describe('addClipWithDelay', () => {
            it('should add defined clips', async () => {
                await hotClipsController.start();
                await expect(clock.tickAsync(10000)).to.not.be.rejectedWith();
            });
            it('should not throw if video url is null', async () => {
                getVideoUrl.restore();
                getVideoUrl = sinon
                    .stub(TwitchSupervisor.prototype, 'getVideoUrl')
                    .resolves(null);

                await hotClipsController.start();
                await expect(clock.tickAsync(100)).to.not.be.rejectedWith();
            });
        });
    });
});
