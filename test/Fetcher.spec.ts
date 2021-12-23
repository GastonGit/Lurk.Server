import * as chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import sinon from 'sinon';
import fetch from 'node-fetch';
import Fetcher from '../lib/Fetcher';
import Logger from '../lib/Logger';

describe('Fetcher suite', function () {
    beforeEach(() => {
        sinon.stub(fetch, 'Promise' as never).resolves({
            json: () =>
                Promise.resolve({
                    data: [],
                    pagination: undefined,
                }),
            ok: true,
            status: 200,
        });
    });
    afterEach(() => {
        sinon.restore();
    });
    describe('Fetch', () => {
        it('should return a FetcherResponse', async () => {
            const result = await Fetcher.fetch('test_url', 'post');
            expect(result).to.have.keys('ok', 'status', 'data', 'pagination');
        });
        it('should return requested data and pagination', async () => {
            sinon.restore();
            sinon.stub(fetch, 'Promise' as never).resolves({
                json: () =>
                    Promise.resolve({
                        data: ['horse', 'cat'],
                        pagination: { cursor: 'dog' },
                    }),
                status: 200,
                ok: true,
            });
            const result = await Fetcher.fetch('goodUrl', 'get');

            expect(result).to.deep.equal({
                ok: true,
                status: 200,
                data: ['horse', 'cat'],
                pagination: { cursor: 'dog' },
            });
        });
        it('should not throw if request does not contain a json payload', async () => {
            sinon.restore();
            sinon.stub(fetch, 'Promise' as never).resolves({
                status: 401,
                ok: false,
            });
            await expect(Fetcher.fetch('goodUrl', 'get')).to.not.rejectedWith();
        });
        it('should return false if request does not contain a json payload', async () => {
            sinon.restore();
            sinon.stub(fetch, 'Promise' as never).resolves({
                status: 401,
                ok: false,
            });
            const result = await Fetcher.fetch('goodUrl', 'get');

            expect(result).to.deep.equal({
                ok: false,
                status: 401,
                data: [],
                pagination: undefined,
            });
        });
        it('should return true for successful requests', async () => {
            const result = await Fetcher.fetch('test_url', 'get');

            expect(result).to.deep.equal({
                ok: true,
                status: 200,
                data: [],
                pagination: undefined,
            });
        });
        it('should return predicted response during development', async () => {
            process.env.NODE_ENV = 'development';

            const result = await Fetcher.fetch('test_url', 'get');
            expect(result).to.deep.equal({
                ok: true,
                status: 200,
                data: [],
                pagination: undefined,
            });
            delete process.env.NODE_ENV;
            process.env.NODE_ENV = 'test';
        });
        it('should return false if node-fetch returns a bad status code', async () => {
            sinon.restore();
            sinon.stub(Logger, 'failure');
            sinon.stub(fetch, 'Promise' as never).resolves({
                json: () =>
                    Promise.resolve({
                        data: undefined,
                        pagination: undefined,
                    }),
                status: 503,
                ok: false,
            });
            const result = await Fetcher.fetch('test_url', 'get');

            expect(result).to.deep.equal({
                ok: false,
                status: 503,
                data: [],
                pagination: undefined,
            });
        });
        it('should throw if node-fetch encounters an error', async () => {
            sinon.restore();
            sinon.stub(fetch, 'Promise' as never).throws('BAD');

            await expect(Fetcher.fetch('test_url', 'get')).to.be.rejectedWith(
                'fetcherFetch :: UNABLE TO COMPLETE FETCH :: BAD',
            );
        });
        it('should throw if method argument is not get or post', async () => {
            await expect(Fetcher.fetch('test_url', 'test')).to.be.rejectedWith(
                'fetcherFetch :: INVALID METHOD',
            );
        });
    });
});
