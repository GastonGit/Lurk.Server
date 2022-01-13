import * as chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import sinon from 'sinon';
import TwitchSupervisor from '../lib/TwitchSupervisor';
import TwitchChatInterface from '../lib/TwitchChatInterface';
import TwitchRequests from '../lib/TwitchRequests';

const twitchSupervisor = new TwitchSupervisor('user', 'pass', {
    requestCount: 2,
    validMessages: ['LUL'],
    blockedStreamers: ['nymn'],
});

describe('TwitchSupervisor suite', () => {
    beforeEach(() => {
        sinon.stub(TwitchChatInterface.prototype);
        sinon.stub(TwitchRequests, 'request100Streams');
    });
    afterEach(() => {
        sinon.restore();
    });
    describe('setupConnection', () => {
        it('should return true if list gets updated and client connects to twitch', async () => {
            sinon.restore();
            sinon
                .stub(TwitchChatInterface.prototype, 'connectToTwitch')
                .resolves(true);
            const request100Streams = sinon.stub(
                TwitchRequests,
                'request100Streams',
            );
            request100Streams.onCall(0).resolves({
                success: true,
                data: [{ user_login: 'Streamerzz', viewer_count: 200 }],
                pagination: { cursor: 'testPag1' },
            });
            request100Streams.onCall(1).resolves({
                success: true,
                data: [{ user_login: 'Ztream', viewer_count: 100 }],
                pagination: { cursor: 'testPag2' },
            });

            const result = await twitchSupervisor.setupConnection();
            expect(result).to.be.true;
        });
        it('should return false if a updated list cannot be fetched', async () => {
            sinon.restore();
            sinon
                .stub(TwitchChatInterface.prototype, 'connectToTwitch')
                .resolves(true);
            sinon.stub(TwitchRequests, 'request100Streams').resolves({
                success: false,
                data: [],
                pagination: undefined,
            });

            const result = await twitchSupervisor.setupConnection();
            expect(result).to.be.false;
        });
    });
    describe('updateChannels', () => {
        it('should return true if channels are updated', async () => {
            sinon.restore();
            sinon.stub(TwitchRequests, 'request100Streams').resolves({
                success: true,
                data: [
                    { user_login: 'test1', viewer_count: 44 },
                    { user_login: 'test2', viewer_count: 100 },
                ],
                pagination: undefined,
            });
            sinon
                .stub(TwitchChatInterface.prototype, 'leaveChannels')
                .resolves(true);
            sinon
                .stub(TwitchChatInterface.prototype, 'joinChannels')
                .resolves(true);

            await twitchSupervisor.updateChannels();

            sinon.restore();
            sinon.stub(TwitchRequests, 'request100Streams').resolves({
                success: true,
                data: [
                    { user_login: 'test1', viewer_count: 0 },
                    { user_login: 'test3', viewer_count: 500 },
                ],
                pagination: undefined,
            });
            sinon
                .stub(TwitchChatInterface.prototype, 'leaveChannels')
                .resolves(true);
            sinon
                .stub(TwitchChatInterface.prototype, 'joinChannels')
                .resolves(true);

            const result = await twitchSupervisor.updateChannels();
            expect(result).to.be.true;
        });
    });
    describe('decreaseHitsByAmount', () => {
        it('should not throw', async () => {
            sinon.restore();
            sinon
                .stub(TwitchChatInterface.prototype, 'connectToTwitch')
                .resolves(true);
            sinon.stub(TwitchRequests, 'request100Streams').resolves({
                success: true,
                data: [{ user_login: 'Streamzz', viewer_count: 200 }],
                pagination: undefined,
            });
            await twitchSupervisor.setupConnection();
            twitchSupervisor.onMessageHandler('Streamzz', {}, 'LUL', true);

            expect(() => {
                twitchSupervisor.decreaseHitsByAmount(1);
            }).to.not.throw();
        });
    });
    describe('increaseHitsByOne', () => {
        it('should not throw if channel is not in streamList', async () => {
            expect(() => {
                twitchSupervisor.onMessageHandler(
                    'this channel does not exist',
                    {},
                    'LUL',
                    true,
                );
            }).to.not.throw();
        });
    });
    describe('getStreamList', () => {
        it('should return an array', () => {
            expect(twitchSupervisor.getStreamList()).to.be.an('array');
        });
    });
    describe('cooldownStreamer', () => {
        it('should not throw', async () => {
            sinon.restore();
            const clock = sinon.useFakeTimers();
            sinon
                .stub(TwitchChatInterface.prototype, 'connectToTwitch')
                .resolves(true);
            sinon.stub(TwitchRequests, 'request100Streams').resolves({
                success: true,
                data: [{ user_login: 'Streamzz', viewer_count: 200 }],
                pagination: undefined,
            });
            await twitchSupervisor.setupConnection();

            expect(() => {
                twitchSupervisor.cooldownStreamer('Streamzz', 10);
            }).to.not.throw();

            clock.tick(100000);
            await Promise.resolve();
        });
    });
    describe('resetStreamer', () => {
        it('should not throw', async () => {
            sinon.restore();
            sinon
                .stub(TwitchChatInterface.prototype, 'connectToTwitch')
                .resolves(true);
            sinon.stub(TwitchRequests, 'request100Streams').resolves({
                success: true,
                data: [{ user_login: 'Streamzz', viewer_count: 200 }],
                pagination: undefined,
            });
            await twitchSupervisor.setupConnection();

            expect(() => {
                twitchSupervisor.resetStreamer('Streamzz');
            }).to.not.throw();
        });
    });
    describe('onMessageHandler', () => {
        it('should not throw', async () => {
            sinon.restore();
            sinon
                .stub(TwitchChatInterface.prototype, 'connectToTwitch')
                .resolves(true);
            sinon.stub(TwitchRequests, 'request100Streams').resolves({
                success: true,
                data: [{ user_login: 'Streamzz', viewer_count: 200 }],
                pagination: undefined,
            });
            await twitchSupervisor.setupConnection();

            expect(() => {
                twitchSupervisor.onMessageHandler('Streamzz', {}, 'LUL', true);
                twitchSupervisor.onMessageHandler('Streamzz', {}, 'test', true);
            }).to.not.throw();
        });
    });
    describe('getVideoUrl', () => {
        it('should return a string if TwitchRequests.getVideoUrl is successful', async () => {
            sinon.restore();
            sinon.stub(TwitchRequests, 'getVideoUrl').resolves('str');
            const result = await twitchSupervisor.getVideoUrl(
                'this string does not matter here',
            );

            expect(result).to.be.equal('str');
        });
    });
    describe('createClip', () => {
        it('should return a clip if TwitchRequests.createClip is successful', async () => {
            sinon.restore();
            sinon
                .stub(TwitchRequests, 'createClip')
                .resolves({ id: 'test', edit_url: 'test' });
            const result = await twitchSupervisor.createClip(
                'this string does not matter here',
            );

            expect(result).to.deep.equal({ id: 'test', edit_url: 'test' });
        });
    });
});
