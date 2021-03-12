const assert = require('chai').assert;
const expect = require('chai').expect

let ClipperClass = require('../lib/Clipper');
let Clipper

describe('Clipper methods', function() {
    before(function (){
        Clipper = new ClipperClass();
    })
    describe('Get clip', function() {
        it('should throw without an argument', function() {
            expect(Clipper.getClip).to.throw();
        });
        it('should return an object', function() {
            expect(Clipper.getClip("KappaPogChamp")).to.be.an('object');
        });
    });
});