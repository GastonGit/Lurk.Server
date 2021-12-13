import * as chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import sinon from 'sinon';
import TwitchRequests from '../lib/TwitchRequests';
import Fetcher from '../lib/Fetcher';
import { FetcherResponse } from '../lib/Interfaces';

let fetch: sinon.SinonStub<[url: string], Promise<FetcherResponse>>;

describe('TwitchRequests suite', () => {
    beforeEach(() => {
        fetch = sinon.stub(Fetcher, 'fetch').resolves({
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
        it('should return undefined if video url does not have a clip', async () => {
            fetch.restore();
            fetch = sinon.stub(Fetcher, 'fetch').resolves({
                status: 200,
                data: [] as Array<any>,
                pagination: undefined,
            });
            const result = await TwitchRequests.getVideoUrl(
                'this string does not matter here',
            );

            expect(result).to.be.equal(undefined);
        });
    });
});
