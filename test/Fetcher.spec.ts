import * as chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import sinon from 'sinon';
import fetch from 'node-fetch';
import Fetcher from '../lib/Fetcher';

describe('Fetcher suite', function () {
    beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        sinon.stub(fetch, 'Promise').resolves({
            json: () =>
                Promise.resolve({
                    data: [],
                    pagination: undefined,
                }),
            status: 200,
        });
    });
    afterEach(() => {
        sinon.restore();
    });
    describe('Fetch', () => {
        it('should return a FetcherResponse', async () => {
            const result = await Fetcher.fetch('test_url');
            expect(result).to.have.keys('status', 'data', 'pagination');
        });
        it('should return predicted response during development', async () => {
            process.env.NODE_ENV = 'development';

            const result = await Fetcher.fetch('test_url');
            expect(result).to.deep.equal({
                status: 200,
                data: [],
                pagination: undefined,
            });
            delete process.env.NODE_ENV;
            process.env.NODE_ENV = 'test';
        });
        it('should return an empty array for data key if data was undefined', async () => {
            sinon.restore();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            sinon.stub(fetch, 'Promise').resolves({
                json: () =>
                    Promise.resolve({
                        data: undefined,
                        pagination: undefined,
                    }),
                status: 200,
            });
            const result = await Fetcher.fetch('test_url');

            expect(result).to.deep.equal({
                status: 200,
                data: [],
                pagination: undefined,
            });
        });
        it('should throw if response does not contain a json key function', async () => {
            sinon.restore();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            sinon.stub(fetch, 'Promise').resolves({ status: 200 });

            await expect(Fetcher.fetch('test_url')).to.be.rejectedWith(
                'fetcherFetch :: UNABLE TO COMPLETE FETCH :: TypeError: response.json is not a function',
            );
        });
    });
});
