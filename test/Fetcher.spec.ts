import * as chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import fetch, * as fetches from 'node-fetch';
import Fetcher from '../lib/Fetcher';
import Logger from '../lib/Logger';

chai.use(chaiAsPromised);

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
                status: 500,
                ok: false,
            });
            await expect(Fetcher.fetch('goodUrl', 'get')).to.not.rejectedWith();
        });
        it('should return false if request does not contain a json payload', async () => {
            sinon.restore();
            sinon.stub(fetch, 'Promise' as never).resolves({
                status: 500,
                ok: false,
            });
            const result = await Fetcher.fetch('goodUrl', 'get');

            expect(result).to.deep.equal({
                ok: false,
                status: 500,
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
        it('should update client app access token if it has expired', async () => {
            sinon.restore();

            const freshToken = 'fresh';
            process.env.CLIENT_APP_ACCESS_TOKEN = 'expired';
            const url = 'test_url';
            const method = 'get';

            sinon.stub(Fetcher, 'updateAppAccessToken').callsFake(async () => {
                process.env.CLIENT_APP_ACCESS_TOKEN = freshToken;
            });

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            sinon.stub(fetches, 'default').callsFake(async (_url, init?) => {
                const OAuth =
                    JSON.parse(JSON.stringify(init?.headers)).Authorization ||
                    '';

                if (OAuth === ` Bearer ${freshToken}`) {
                    return {
                        json: () =>
                            Promise.resolve({
                                data: ['horse', 'cat'],
                                pagination: { cursor: 'dog' },
                            }),
                        status: 200,
                        ok: true,
                    };
                } else {
                    return {
                        json: () =>
                            Promise.resolve({
                                data: undefined,
                                pagination: undefined,
                            }),
                        status: 401,
                        ok: false,
                    };
                }
            });

            const result = await Fetcher.fetch(url, method);

            expect(result).to.deep.equal({
                ok: true,
                status: 200,
                data: ['horse', 'cat'],
                pagination: { cursor: 'dog' },
            });
        });
    });
    describe('updateAppAccessToken', () => {
        it('should update CLIENT_APP_ACCESS_TOKEN environment variable', async () => {
            const defaultValue = process.env.CLIENT_APP_ACCESS_TOKEN;
            sinon.restore();
            sinon.stub(fetch, 'Promise' as never).resolves({
                json: () =>
                    Promise.resolve({
                        access_token: 'good access token',
                    }),
                status: 200,
            });

            await Fetcher.updateAppAccessToken();
            expect(defaultValue).to.not.equal(
                process.env.CLIENT_APP_ACCESS_TOKEN,
            );

            process.env.CLIENT_APP_ACCESS_TOKEN = defaultValue;
        });
        it('should throw if request fails', async () => {
            sinon.restore();
            sinon.stub(fetch, 'Promise' as never).resolves({
                json: () => Promise.resolve({}),
                status: 500,
            });
            await expect(Fetcher.updateAppAccessToken()).to.be.rejectedWith(
                'fetcherFetch :: UNABLE TO UPDATE APP ACCESS TOKEN',
            );

            sinon.restore();
            sinon.stub(fetch, 'Promise' as never).resolves({
                status: 500,
            });
            await expect(Fetcher.updateAppAccessToken()).to.be.rejectedWith(
                'fetcherFetch :: UNABLE TO UPDATE APP ACCESS TOKEN',
            );
        });
    });
});
