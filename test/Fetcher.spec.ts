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
            ok: true,
        });
    });
    afterEach(() => {
        sinon.restore();
    });
    describe('Fetch', () => {
        it('should return a FetcherResponse', async () => {
            const result = await Fetcher.fetch('test_url');
            expect(result).to.have.keys('ok', 'data', 'pagination');
        });
        it('should return true for successful requests', async () => {
            sinon.restore();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            sinon.stub(fetch, 'Promise').resolves({
                json: () =>
                    Promise.resolve({
                        data: [],
                        pagination: undefined,
                    }),
                ok: true,
            });
            const result = await Fetcher.fetch('test_url');

            expect(result).to.deep.equal({
                ok: true,
                data: [],
                pagination: undefined,
            });
        });
        it('should return predicted response during development', async () => {
            process.env.NODE_ENV = 'development';

            const result = await Fetcher.fetch('test_url');
            expect(result).to.deep.equal({
                ok: true,
                data: [],
                pagination: undefined,
            });
            delete process.env.NODE_ENV;
            process.env.NODE_ENV = 'test';
        });
        it('should return false if node-fetch returns a bad status code', async () => {
            sinon.restore();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            sinon.stub(fetch, 'Promise').resolves({
                json: () =>
                    Promise.resolve({
                        data: undefined,
                        pagination: undefined,
                    }),
                status: 503,
            });
            const result = await Fetcher.fetch('test_url');

            expect(result).to.deep.equal({
                ok: false,
                data: [],
                pagination: undefined,
            });
        });
        it('should throw if node-fetch encounters an error', async () => {
            sinon.restore();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            sinon.stub(fetch, 'Promise').throws('BAD');

            await expect(Fetcher.fetch('test_url')).to.be.rejectedWith(
                'fetcherFetch :: UNABLE TO COMPLETE FETCH :: BAD',
            );
        });
    });
});
