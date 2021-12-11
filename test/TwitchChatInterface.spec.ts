import * as chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import sinon from 'sinon';
import TwitchChatInterface from '../lib/TwitchChatInterface';
import tmiImport from 'tmi.js';
import Logger from '../lib/Logger';
import ExtremeTimer from '../lib/ExtremeTimer';

const tmi = tmiImport.client.prototype;
const twitchClient = new TwitchChatInterface('user', 'pass', 0);

describe('TwitchChatInterface suite', () => {
    before(() => {
        sinon.stub(Logger);
        sinon.stub(ExtremeTimer);
    });
    beforeEach(() => {
        sinon.stub(tmi);
    });
    afterEach(() => {
        sinon.restore();
    });
    describe('connectToTwitch', () => {
        it('should return false connection fails', async () => {
            sinon.restore();
            const client = sinon.stub(tmi);
            client.connect.rejects('Connection Error');

            const result = await twitchClient.connectToTwitch([]);
            expect(result).to.be.false;
        });
        it('should return true if connection succeeds', async () => {
            sinon.restore();
            const client = sinon.stub(tmi);
            client.connect.resolves(['server', 'port']);
            client.on.onCall(0).callsArg(1);

            const result = await twitchClient.connectToTwitch([]);
            expect(result).to.be.true;
        });
    });
    describe('Disconnect event', () => {
        it('should throw', async () => {
            sinon.restore();
            const client = sinon.stub(tmi);
            client.connect.resolves(['server', 'port']);
            client.on.onCall(1).callsArg(1);

            await expect(twitchClient.connectToTwitch([])).to.rejectedWith();
        });
    });
    describe('joinChannels', () => {
        it('should return true if all channels are joined', async () => {
            sinon.restore();

            const client = sinon.stub(tmi);
            client.join.resolves([]);

            const result = await twitchClient.joinChannels([
                'tester',
                'testing',
                'testingAgain',
                'tester',
                'testing',
                'testingAgain',
                'tester',
                'testing',
                'testingAgain',
                'tester',
                'testing',
                'testingAgain',
            ]);

            expect(result).to.be.true;
        });
        it('should return false if joining is completely unsuccessful', async () => {
            sinon.restore();
            const client = sinon.stub(tmi);
            client.join.rejects();

            const result = await twitchClient.joinChannels(['tester']);

            expect(result).to.be.false;
        });
    });
    describe('leaveChannels', () => {
        it('should return true if all channels are left', async () => {
            sinon.restore();
            const client = sinon.stub(tmi);
            client.part.resolves([]);

            const result = await twitchClient.leaveChannels([
                'tester',
                'testing',
                'testingAgain',
            ]);

            expect(result).to.be.true;
        });
        it('should return false if leaving completely is unsuccessful', async () => {
            sinon.restore();
            const client = sinon.stub(tmi);
            client.part.rejects();

            const result = await twitchClient.leaveChannels(['tester']);

            expect(result).to.be.false;
        });
    });
});
