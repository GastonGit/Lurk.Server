import * as chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import sinon from 'sinon';
import MonitorTwitchChat from '../lib/MonitorTwitchChat';
import TwitchClient from '../lib/TwitchClient';
import Fetcher from '../lib/Fetcher';

const monitorTwitchChat = new MonitorTwitchChat('user', 'pass', 0, {
    requestCount: 2,
    validMessages: ['LUL'],
});

describe('MonitorTwitchChat suite', () => {
    beforeEach(() => {
        sinon.stub(TwitchClient.prototype);
        sinon.stub(Fetcher, 'fetch').resolves({
            status: 200,
            data: [],
            pagination: undefined,
        });
    });
    afterEach(() => {
        sinon.restore();
    });
    describe('setupConnection', () => {
        it('should return true if list gets updated and client connects to twitch', async () => {
            sinon.restore();
            sinon
                .stub(TwitchClient.prototype, 'connectToTwitch')
                .resolves(true);
            const fetch = sinon.stub(Fetcher, 'fetch');
            fetch.onCall(0).resolves({
                status: 200,
                data: [{ user_login: 'Streamerzz', viewer_count: 200 }],
                pagination: { cursor: 'testPag1' },
            });
            fetch.onCall(1).resolves({
                status: 200,
                data: [{ user_login: 'Ztream', viewer_count: 100 }],
                pagination: { cursor: 'testPag2' },
            });

            const result = await monitorTwitchChat.setupConnection();
            expect(result).to.be.true;
        });
        it('should return false if a updated list cannot be fetched', async () => {
            sinon.restore();
            sinon
                .stub(TwitchClient.prototype, 'connectToTwitch')
                .resolves(true);
            sinon.stub(Fetcher, 'fetch').resolves({
                status: 404,
                data: [],
                pagination: undefined,
            });

            const result = await monitorTwitchChat.setupConnection();
            expect(result).to.be.false;
        });
    });
    describe('updateChannels', () => {
        it('should return true if channels are updated', async () => {
            sinon.restore();
            sinon.stub(Fetcher, 'fetch').resolves({
                status: 200,
                data: [],
                pagination: undefined,
            });
            sinon.stub(TwitchClient.prototype, 'leaveChannels').resolves(true);
            sinon.stub(TwitchClient.prototype, 'joinChannels').resolves(true);

            const result = await monitorTwitchChat.updateChannels();
            expect(result).to.be.true;
        });
    });
    describe('descreaseHitsByAmount', () => {
        it('should not throw', async () => {
            sinon.restore();
            sinon
                .stub(TwitchClient.prototype, 'connectToTwitch')
                .resolves(true);
            sinon.stub(Fetcher, 'fetch').resolves({
                status: 200,
                data: [{ user_login: 'Streamzz', viewer_count: 200 }],
                pagination: undefined,
            });
            await monitorTwitchChat.setupConnection();
            monitorTwitchChat.onMessageHandler('Streamzz', {}, 'LUL', true);

            expect(() => {
                monitorTwitchChat.decreaseHitsByAmount(1);
            }).to.not.throw();
        });
    });
    describe('getStreamList', () => {
        it('should return an array', () => {
            expect(monitorTwitchChat.getStreamList()).to.be.an('array');
        });
    });
    describe('cooldownStreamer', () => {
        it('should not throw', async () => {
            sinon.restore();
            const clock = sinon.useFakeTimers();
            sinon
                .stub(TwitchClient.prototype, 'connectToTwitch')
                .resolves(true);
            sinon.stub(Fetcher, 'fetch').resolves({
                status: 200,
                data: [{ user_login: 'Streamzz', viewer_count: 200 }],
                pagination: undefined,
            });
            await monitorTwitchChat.setupConnection();

            expect(() => {
                monitorTwitchChat.cooldownStreamer('Streamzz', 10);
            }).to.not.throw();

            clock.tick(100000);
            await Promise.resolve();
        });
    });
    describe('resetStreamer', () => {
        it('should not throw', async () => {
            sinon.restore();
            sinon
                .stub(TwitchClient.prototype, 'connectToTwitch')
                .resolves(true);
            sinon.stub(Fetcher, 'fetch').resolves({
                status: 200,
                data: [{ user_login: 'Streamzz', viewer_count: 200 }],
                pagination: undefined,
            });
            await monitorTwitchChat.setupConnection();

            expect(() => {
                monitorTwitchChat.resetStreamer('Streamzz');
            }).to.not.throw();
        });
    });
    describe('onMessageHandler', () => {
        it('should not throw', async () => {
            sinon.restore();
            sinon
                .stub(TwitchClient.prototype, 'connectToTwitch')
                .resolves(true);
            sinon.stub(Fetcher, 'fetch').resolves({
                status: 200,
                data: [{ user_login: 'Streamzz', viewer_count: 200 }],
                pagination: undefined,
            });
            await monitorTwitchChat.setupConnection();

            expect(() => {
                monitorTwitchChat.onMessageHandler('Streamzz', {}, 'LUL', true);
                monitorTwitchChat.onMessageHandler(
                    'Streamzz',
                    {},
                    'test',
                    true,
                );
            }).to.not.throw();
        });
    });
});
