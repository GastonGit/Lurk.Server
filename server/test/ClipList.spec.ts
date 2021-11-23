import { assert, expect } from 'chai';
import ClipList from '../lib/ClipList';

const clipList = new ClipList();

describe('ClipList suite', function () {
    describe('Getting clips from the list', function () {
        it('should return a string array', function () {
            assert.isArray(clipList.getList());
        });
    });
    describe('Adding clips to the list', function () {
        it('should be able to add a single clip to the list', function () {
            const clip = 'Mocha';
            clipList.addClip(clip);

            expect(clipList.getList()).to.include(clip);
        });
        it('should be able to add multiple clips to the list', function () {
            const clips = ['Billy', 'Jinny', 'Terry'];

            for (let i = 0; i < clips.length; i++) {
                clipList.addClip(clips[i]);
            }

            expect(clipList.getList()).to.include.members(clips);
        });
    });
    describe('Removing clips from the list', function () {
        it('should remove the oldest element', function () {
            const oldestElement = 'Mocha';
            expect(clipList.getList()).to.include(oldestElement);

            clipList.removeClip();

            expect(clipList.getList()).to.not.include(oldestElement);
        });
    });
});
