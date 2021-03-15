const assert = require('chai').assert;
const expect = require('chai').expect

let HotClipsControllerClass = require('../lib/HotClipsController');
let HotClipsController;

describe('HotClipsController methods', function() {
    before(function (){
        HotClipsController = new HotClipsControllerClass();
    })
    describe('Get list', function() {
        it('should return an array', function() {
            assert.isArray(HotClipsController.getList());
        });
    });
});