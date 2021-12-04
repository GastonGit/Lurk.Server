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
import EventIntervals from '../lib/EventIntervals';

const hotClipsController = new HotClipsController();

describe('HotClipsController suite', () => {
    beforeEach(() => {
        sinon
            .stub(MonitorTwitchChat.prototype, 'setupConnection')
            .resolves(true);
        sinon
            .stub(MonitorTwitchChat.prototype, 'updateChannels')
            .resolves(true);
        sinon.stub(MonitorTwitchChat.prototype, 'getStreamList').returns([
            {
                cooldown: false,
                hits: 10000,
                viewer_count: 20,
                user_name: 'ugly221',
            },
        ]);
        const testArray = ['test'];
        testArray.length = 21;
        sinon.stub(ClipList.prototype, 'getList').returns(testArray);
        sinon.stub(Clipper.prototype, 'createClip').resolves({
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
        sinon.stub(Clipper.prototype, 'getVideoUrl').resolves('videoUrl');
        sinon.stub(Logger, 'error');
        sinon
            .stub(EventIntervals.prototype, 'createConstrainedInterval')
            .returns();

        sinon
            .stub(EventIntervals.prototype, 'startIndependentInterval')
            .returns();
        sinon.stub(EventIntervals.prototype, 'startSuperInterval').returns();
        sinon.useFakeTimers();
    });
    afterEach(() => {
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
                .stub(MonitorTwitchChat.prototype, 'setupConnection')
                .resolves(false);
            await expect(hotClipsController.start()).to.be.rejectedWith(
                'Connection setup failed',
            );
        });
    });
    describe('Events', () => {
        it('should not throw for predicted events', async () => {
            await expect(
                hotClipsController.eventSystem('main'),
            ).to.not.be.rejectedWith();

            const clock = sinon.useFakeTimers();
            await hotClipsController.eventSystem('hit');
            clock.tick(100000);
            await Promise.resolve();
            await expect(
                hotClipsController.eventSystem('hit'),
            ).to.not.be.rejectedWith();

            await expect(
                hotClipsController.eventSystem('reduce'),
            ).to.not.be.rejectedWith();

            await expect(
                hotClipsController.eventSystem('remove'),
            ).to.not.be.rejectedWith();
            sinon.restore();
            sinon.stub(ClipList.prototype, 'getList').returns([]);
            await expect(
                hotClipsController.eventSystem('remove'),
            ).to.not.be.rejectedWith();
        });
        it('should throw for unpredicted events', async () => {
            await expect(
                hotClipsController.eventSystem('unpredicted'),
            ).to.be.rejectedWith('eventSystem - Unknown case: unpredicted');
        });
    });
    describe('Spikes', () => {
        it('should not throw if unable to clip', async () => {
            sinon.restore();
            sinon.stub(MonitorTwitchChat.prototype, 'getStreamList').returns([
                {
                    cooldown: false,
                    hits: 10000,
                    viewer_count: 20,
                    user_name: 'ugly221',
                },
            ]);
            sinon.stub(Clipper.prototype, 'createClip').throws();
            await expect(
                hotClipsController.eventSystem('hit'),
            ).to.not.be.rejectedWith();
        });
        it('should not throw if channel has cooldown', async () => {
            sinon.restore();
            sinon.stub(MonitorTwitchChat.prototype, 'getStreamList').returns([
                {
                    cooldown: true,
                    hits: 10000,
                    viewer_count: 20,
                    user_name: 'ugly221',
                },
            ]);
            await expect(
                hotClipsController.eventSystem('hit'),
            ).to.not.be.rejectedWith();
        });
        it('should not throw if hits are less then spike requirement', async () => {
            sinon.restore();
            sinon.stub(MonitorTwitchChat.prototype, 'getStreamList').returns([
                {
                    cooldown: false,
                    hits: 1,
                    viewer_count: 50000,
                    user_name: 'ugly221',
                },
            ]);

            await expect(
                hotClipsController.eventSystem('hit'),
            ).to.not.be.rejectedWith();
        });
        it('should not throw if clip creation fails', async () => {
            sinon.restore();
            sinon.stub(MonitorTwitchChat.prototype, 'getStreamList').returns([
                {
                    cooldown: false,
                    hits: 20,
                    viewer_count: 10,
                    user_name: 'ugly221',
                },
            ]);
            sinon.stub(Clipper.prototype, 'createClip').resolves(undefined);

            await expect(
                hotClipsController.eventSystem('hit'),
            ).to.not.be.rejectedWith();
        });
        it('should not throw if video url cant be found', async () => {
            sinon.restore();
            sinon.stub(MonitorTwitchChat.prototype, 'getStreamList').returns([
                {
                    cooldown: false,
                    hits: 20,
                    viewer_count: 10,
                    user_name: 'ugly221',
                },
            ]);
            sinon.stub(Clipper.prototype, 'createClip').resolves({
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
            sinon.stub(Clipper.prototype, 'getVideoUrl').resolves(undefined);

            const clock = sinon.useFakeTimers();
            await hotClipsController.eventSystem('hit');
            clock.tick(100000);
            await Promise.resolve();

            await expect(
                hotClipsController.eventSystem('hit'),
            ).to.not.be.rejectedWith();
        });
    });
});
