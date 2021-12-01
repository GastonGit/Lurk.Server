import * as chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
chai.use(chaiAsPromised);
import Clipper from '../lib/Clipper';
import Fetcher from '../lib/Fetcher';
import Logger from '../lib/Logger';
import { Clip } from '../lib/Interfaces';

const clipper = new Clipper();

describe('Clipper suite', () => {
    beforeEach(() => {
        sinon.stub(Logger, 'success');
        sinon.stub(Logger, 'failure');
    });
    afterEach(() => {
        sinon.restore();
    });
    describe('Getting video url', () => {
        it('should resolve', async () => {
            sinon.stub(Fetcher, 'fetch').resolves({
                status: 200,
                data: [
                    {
                        thumbnail_url:
                            'https://clips-media-assets2.twitch.tv/AT-cm%7C1140679825-preview-480x272.jpg',
                    },
                ] as Array<any>,
                pagination: undefined,
            });
            const result = await clipper.getVideoUrl(
                'this string does not matter here',
            );

            expect(result).to.be.equal(
                'https://clips-media-assets2.twitch.tv/AT-cm%7C1140679825.mp4',
            );
        });
        it('should return undefined if video url does not have a clip', async () => {
            sinon.stub(Fetcher, 'fetch').resolves({
                status: 200,
                data: [] as Array<any>,
                pagination: undefined,
            });
            const result = await clipper.getVideoUrl(
                'this string does not matter here',
            );

            expect(result).to.be.equal(undefined);
        });
    });
    describe('Creating clips', () => {
        it('should return undefined if streamer can not be found', async () => {
            sinon.stub(Fetcher, 'fetch').resolves({
                status: 404,
                data: [] as Array<any>,
                pagination: undefined,
            });
            const result = await clipper.createClip(
                'this string does not matter here',
            );

            expect(result).to.be.equal(undefined);
        });
        it('should return a Clip if streamer is found and clip creation is successful', async () => {
            const fakeFetch = sinon.stub(Fetcher, 'fetch');

            fakeFetch.onCall(0).resolves({
                status: 200,
                data: [{ id: '1337' }] as Array<any>,
                pagination: undefined,
            });
            fakeFetch.onCall(1).resolves({
                status: 200,
                data: [clip1] as Array<any>,
                pagination: undefined,
            });

            const result = await clipper.createClip(
                'this string does not matter here',
            );

            expect(result).to.be.equal(clip1);
        });
        it('should still return a clip if clip creation fetch response status is 202', async () => {
            const fakeFetch = sinon.stub(Fetcher, 'fetch');

            fakeFetch.onCall(0).resolves({
                status: 200,
                data: [{ id: '1337' }] as Array<any>,
                pagination: undefined,
            });
            fakeFetch.onCall(1).resolves({
                status: 202,
                data: [clip1] as Array<any>,
                pagination: undefined,
            });

            const result = await clipper.createClip(
                'this string does not matter here',
            );

            expect(result).to.be.equal(clip1);
        });
        it('should return undefined if clip creation fetch does not work', async () => {
            const fakeFetch = sinon.stub(Fetcher, 'fetch');

            fakeFetch.onCall(0).resolves({
                status: 200,
                data: [{ id: '1337' }] as Array<any>,
                pagination: undefined,
            });
            fakeFetch.onCall(1).resolves({
                status: 503,
                data: [] as Array<any>,
                pagination: undefined,
            });

            const result = await clipper.createClip(
                'this string does not matter here',
            );

            expect(result).to.be.equal(undefined);
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
