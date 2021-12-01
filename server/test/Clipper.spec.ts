import * as chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import Clipper from '../lib/Clipper';
import Fetcher from '../lib/Fetcher';
import sinon from 'sinon';

const clipper = new Clipper();

describe('Clipper suite', () => {
    beforeEach(() => {
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
    });
    afterEach(() => {
        sinon.restore();
    });
    describe('Getting video url', () => {
        it('should resolve', async () => {
            const result = await clipper.getVideoUrl(
                'this string does not matter here',
            );

            expect(result).to.be.equal(
                'https://clips-media-assets2.twitch.tv/AT-cm%7C1140679825.mp4',
            );
        });
    });
});
