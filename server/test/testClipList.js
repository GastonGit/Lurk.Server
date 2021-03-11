const assert = require('chai').assert;
const expect = require('chai').expect

let ClipListClass = require('../lib/ClipList');


describe('ClipList methods', function() {
    describe('Getting the list', function() {
        let ClipList = new ClipListClass();
        it('should return an array', function() {
            assert.isArray(ClipList.getList());
        });
    });
    describe('Adding clips', function(){
        let ClipList = new ClipListClass();
        it('should return true when adding a string containing a twitch clip url', function() {
            expect(ClipList.addClip("https://clips.twitch.tv/HealthyDelightfulEchidnaKappaPride")).to.be.true;
        });
        it('should return false when adding a string that is not a twitch clip url', function() {
            expect(ClipList.addClip("https://www.test.com/testing")).to.be.false;
            expect(ClipList.addClip("eb5+ 9uy349qyb5v97f15")).to.be.false;
            expect(ClipList.addClip("https://byv04um3608406304/.com/.")).to.be.false;
            expect(ClipList.addClip("https://www.test.com")).to.be.false;
            expect(ClipList.addClip("www.test.com/testing")).to.be.false;
            expect(ClipList.addClip("https://www.clips.test.com/testing")).to.be.false;
            expect(ClipList.addClip("https://www.clips.twitch.tv/")).to.be.false;
            expect(ClipList.addClip("https://clips.twitch.tv/")).to.be.false;
        });
        it('should return false when adding an integer', function() {
            expect(ClipList.addClip(20)).to.be.false;
            expect(ClipList.addClip(0)).to.be.false;
            expect(ClipList.addClip(-1)).to.be.false;
            expect(ClipList.addClip(1000000000)).to.be.false;
            expect(ClipList.addClip(94489098498020942)).to.be.false;
            expect(ClipList.addClip(-94489098498020942)).to.be.false;
        });
        it('should return false when adding an undefined value', function() {
            expect(ClipList.addClip(undefined)).to.be.false;
        });
        it('should not add clip to list when addClip returns false', function() {
            const string1 = "https://www.test.com/testing";
            expect(ClipList.addClip(string1)).to.be.false;
            expect(ClipList.getList()).to.not.include(string1);
        });
        it('should add clip to list when addClip returns true', function() {
            const string1 = "https://clips.twitch.tv/HealthyDelightfulEchidnaKappaPride";
            expect(ClipList.addClip(string1)).to.be.true;
            expect(ClipList.getList()).to.include(string1);
        });
    })
});