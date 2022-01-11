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
const twitchClient = new TwitchChatInterface('user', 'pass');

let connect: sinon.SinonStub<any[], any> | sinon.SinonStub<unknown[], unknown>;
let on: sinon.SinonStub<any[], any>;
let join: sinon.SinonStub<any[], any>;
let part: sinon.SinonStub<any[], any>;

describe('TwitchChatInterface suite', () => {
    before(() => {
        sinon.stub(Logger);
        sinon.stub(ExtremeTimer);
    });
    beforeEach(() => {
        connect = sinon.stub(tmi, 'connect').resolves(['server', 'port']);
        on = sinon.stub(tmi, 'on').onCall(0).callsArg(1);
        join = sinon.stub(tmi, 'join').resolves([]);
        part = sinon.stub(tmi, 'part').resolves([]);
    });
    afterEach(() => {
        connect.restore();
        on.restore();
        join.restore();
        part.restore();
    });
    describe('connectToTwitch', () => {
        it('should return false connection fails', async () => {
            connect.restore();
            connect = sinon.stub(tmi, 'connect').rejects('Connection Error');

            const result = await twitchClient.connectToTwitch([]);
            expect(result).to.be.false;
        });
        it('should return true if connection succeeds', async () => {
            const result = await twitchClient.connectToTwitch([]);
            expect(result).to.be.true;
        });
    });
    describe('Disconnect event', () => {
        it('should throw', async () => {
            on.restore();
            on = sinon.stub(tmi, 'on').onCall(1).callsArg(1);

            await expect(twitchClient.connectToTwitch([])).to.rejectedWith();
        });
    });
    describe('joinChannels', () => {
        it('should return true if all channels are joined', async () => {
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
            join.restore();
            join = sinon.stub(tmi, 'join').rejects();

            const result = await twitchClient.joinChannels(['tester']);

            expect(result).to.be.false;
        });
        it('should return true if array argument is empty', async () => {
            const result = await twitchClient.joinChannels([]);

            expect(result).to.be.true;
        });
    });
    describe('leaveChannels', () => {
        it('should return true if all channels are left', async () => {
            const result = await twitchClient.leaveChannels([
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
        it('should return false if leaving completely is unsuccessful', async () => {
            part.restore();
            part = sinon.stub(tmi, 'part').rejects();

            const result = await twitchClient.leaveChannels(['tester']);

            expect(result).to.be.false;
        });
        it('should return true if array argument is empty', async () => {
            const result = await twitchClient.leaveChannels([]);

            expect(result).to.be.true;
        });
    });
});
