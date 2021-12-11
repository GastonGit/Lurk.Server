import * as chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import sinon from 'sinon';
import TwitchRequests from '../lib/TwitchRequests';
import Fetcher from '../lib/Fetcher';

describe('TwitchRequests suite', () => {
    beforeEach(() => {
        sinon.stub(Fetcher, 'fetch').resolves({
            status: 200,
            data: [],
            pagination: undefined,
        });
    });
    afterEach(() => {
        sinon.restore();
    });
    describe('request100Streams', () => {
        it('should return an object with expected keys success, data and pagination', async () => {
            const requestedStreams = await TwitchRequests.request100Streams(
                'test',
            );
            expect(requestedStreams).to.have.all.keys(
                'success',
                'data',
                'pagination',
            );
        });
        it('should resolve even if pagination argument is undefined', async () => {
            await expect(
                TwitchRequests.request100Streams(undefined),
            ).to.not.rejectedWith();
        });
    });
});
