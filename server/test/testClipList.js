const assert = require('chai').assert;
const expect = require('chai').expect

let ClipListClass = require('../lib/ClipList');
let ClipList

describe('ClipList methods', function() {
    before(function (){
        ClipList = new ClipListClass();
    })
    describe('Getting the list', function() {
        let ClipList = new ClipListClass();
        it('should return an array', function() {
            assert.isArray(ClipList.getList());
        });
    });
    describe('Adding clips', function(){
        let ClipList = new ClipListClass();
        it('should not throw if argument is a string', function() {
            expect(function (){ClipList.addClip("https://clips.twitch.tv/HealthyDelightfulEchidnaKappaPride")}).to.not.throw();
        });
        it('should throw if argument is not a string', function() {
            expect(function (){ClipList.addClip(123)}).to.throw();
            expect(function (){ClipList.addClip(false)}).to.throw();
        });
        it('should add clip to list', function() {
            const string1 = "https://clips.twitch.tv/HealthyDelightfulEchidnaKappaPride";
            ClipList.addClip(string1)
            expect(ClipList.getList()).to.include(string1);
        });
    })
    describe('Removing clips', function() {
        it('should remove a clip from the clipList', function() {
            expect(ClipList.getList()).to.be.empty;

            const string1 = "https://clips.twitch.tv/HealthyDelightfulEchidnaKappaPride";
            ClipList.addClip(string1)

            expect(ClipList.getList()).to.not.be.empty;

            ClipList.removeClip();
            expect(ClipList.getList()).to.be.empty;
        });
        it('should remove the oldest added clip', function() {
            const string1 = "https://clips.twitch.tv/HealthyDelightfulEchidnaKappaPride";
            ClipList.addClip(string1)

            ClipList.addClip("https://clips.twitch.tv/Kappa")
            ClipList.addClip("https://clips.twitch.tv/PogChamp")

            ClipList.removeClip();
            expect(ClipList.getList()).to.not.include(string1);
        });
    });
});