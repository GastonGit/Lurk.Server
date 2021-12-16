import * as chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import sinon from 'sinon';
import TwitchRequests from '../lib/TwitchRequests';
import Fetcher from '../lib/Fetcher';
import { Clip, FetcherResponse } from '../lib/Interfaces';

let fetch: sinon.SinonStub<[url: string], Promise<FetcherResponse>>;

describe('TwitchRequests suite', () => {
    beforeEach(() => {
        fetch = sinon.stub(Fetcher, 'fetch').resolves({
            ok: true,
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
                data: [] as Array<any>,
                pagination: undefined,
            });
            const result = await TwitchRequests.createClip(
                'this string does not matter here',
            );

            expect(result).to.be.equal(null);
        });
        it('should return a Clip if streamer is found and clip creation is successful', async () => {
            fetch.restore();
            fetch = sinon.stub(Fetcher, 'fetch');

            fetch.onCall(0).resolves({
                ok: true,
                data: [{ id: '1337' }] as Array<any>,
                pagination: undefined,
            });
            fetch.onCall(1).resolves({
                ok: true,
                data: [clip1] as Array<any>,
                pagination: undefined,
            });

            const result = await TwitchRequests.createClip(
                'this string does not matter here',
            );

            expect(result).to.be.equal(clip1);
        });
        it('should return null if clip creation fetch does not work', async () => {
            fetch.restore();
            fetch = sinon.stub(Fetcher, 'fetch');

            fetch.onCall(0).resolves({
                ok: true,
                data: [{ id: '1337' }] as Array<any>,
                pagination: undefined,
            });
            fetch.onCall(1).resolves({
                ok: false,
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

const clip1: Clip = {
    broadcaster_id: '',
    broadcaster_name: '',
    created_at: '',
    creator_id: '',
    creator_name: '',
    duration: 0,
    embed_url: '',
    game_id: '',
    language: '',
    thumbnail_url: '',
    title: '',
    url: '',
    video_id: '',
    view_count: 0,
    id: '1337',
};
