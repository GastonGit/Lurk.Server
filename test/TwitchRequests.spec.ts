import * as chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import sinon from 'sinon';
import TwitchRequests from '../lib/TwitchRequests';
import Fetcher from '../lib/Fetcher';
import { FetcherResponse } from '../lib/Interfaces';

let fetch: sinon.SinonStub<[string, string], Promise<FetcherResponse>>;

describe('TwitchRequests suite', () => {
    beforeEach(() => {
        fetch = sinon.stub(Fetcher, 'fetch').resolves({
            ok: true,
            status: 200,
            data: [],
            pagination: undefined,
        });
    });
    afterEach(() => {
        fetch.restore();
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
    describe('Getting video url', () => {
        it('should resolve', async () => {
            fetch.restore();
            fetch = sinon.stub(Fetcher, 'fetch').resolves({
                ok: true,
                status: 200,
                data: [
                    {
                        thumbnail_url:
                            'https://clips-media-assets2.twitch.tv/AT-cm%7C1140679825-preview-480x272.jpg',
                    },
                ] as Array<any>,
                pagination: undefined,
            });
            const result = await TwitchRequests.getVideoUrl(
                'this string does not matter here',
            );

            expect(result).to.be.equal(
                'https://clips-media-assets2.twitch.tv/AT-cm%7C1140679825.mp4',
            );
        });
        it('should return null if video url does not have a clip', async () => {
            fetch.restore();
            fetch = sinon.stub(Fetcher, 'fetch').resolves({
                ok: true,
                status: 200,
                data: [],
                pagination: undefined,
            });
            const result = await TwitchRequests.getVideoUrl(
                'this string does not matter here',
            );

            expect(result).to.be.equal(null);
        });
    });
    describe('Creating clips', () => {
        it('should return null if streamer can not be found', async () => {
            fetch.restore();
            fetch = sinon.stub(Fetcher, 'fetch').resolves({
                ok: false,
                status: 404,
                data: [] as Array<any>,
                pagination: undefined,
            });
            const result = await TwitchRequests.createClip(
                'this string does not matter here',
            );

            expect(result).to.be.equal(null);
        });
        it('should not throw if clip creation fails', async () => {
            fetch.restore();
            fetch = sinon.stub(Fetcher, 'fetch');

            //
            // 401
            //
            fetch.onCall(0).resolves({
                ok: true,
                status: 200,
                data: [{ id: '1337' }],
                pagination: undefined,
            });
            fetch.onCall(1).resolves({
                ok: false,
                status: 401,
                data: [],
                pagination: undefined,
            });

            await expect(
                TwitchRequests.createClip('this string does not matter here'),
            ).to.not.be.rejectedWith();

            //
            // 403
            //
            fetch.onCall(2).resolves({
                ok: true,
                status: 200,
                data: [{ id: '1337' }],
                pagination: undefined,
            });
            fetch.onCall(3).resolves({
                ok: false,
                status: 403,
                data: [],
                pagination: undefined,
            });

            await expect(
                TwitchRequests.createClip('this string does not matter here'),
            ).to.not.be.rejectedWith();

            //
            // 503
            //
            fetch.onCall(4).resolves({
                ok: true,
                status: 200,
                data: [{ id: '1337' }],
                pagination: undefined,
            });
            fetch.onCall(5).resolves({
                ok: false,
                status: 503,
                data: [],
                pagination: undefined,
            });

            await expect(
                TwitchRequests.createClip('this string does not matter here'),
            ).to.not.be.rejectedWith();

            //
            // else
            //
            fetch.onCall(6).resolves({
                ok: true,
                status: 200,
                data: [{ id: '1337' }],
                pagination: undefined,
            });
            fetch.onCall(7).resolves({
                ok: false,
                status: 666,
                data: [],
                pagination: undefined,
            });

            await expect(
                TwitchRequests.createClip('this string does not matter here'),
            ).to.not.be.rejectedWith();
        });
        it('should return strings if streamer is found and clip creation is successful', async () => {
            fetch.restore();
            fetch = sinon.stub(Fetcher, 'fetch');

            fetch.onCall(0).resolves({
                ok: true,
                status: 200,
                data: [{ id: '1337' }] as Array<any>,
                pagination: undefined,
            });
            fetch.onCall(1).resolves({
                ok: true,
                status: 200,
                data: [{ id: 'test', edit_url: 'test' }] as Array<any>,
                pagination: undefined,
            });

            const result = await TwitchRequests.createClip(
                'this string does not matter here',
            );

            expect(result).to.deep.equal({ id: 'test', edit_url: 'test' });
        });
        it('should return null if clip creation fetch does not work', async () => {
            fetch.restore();
            fetch = sinon.stub(Fetcher, 'fetch');

            fetch.onCall(0).resolves({
                ok: true,
                status: 200,
                data: [{ id: '1337' }] as Array<any>,
                pagination: undefined,
            });
            fetch.onCall(1).resolves({
                ok: false,
                status: 503,
                data: [] as Array<any>,
                pagination: undefined,
            });

            const result = await TwitchRequests.createClip(
                'this string does not matter here',
            );

            expect(result).to.be.equal(null);
        });
    });
});
