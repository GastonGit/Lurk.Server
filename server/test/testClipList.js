const assert = require('chai').assert;

let ClipList = require('../lib/ClipList');

describe('ClipList methods', function() {
    describe('getList', function() {
        it('should return an array', function() {
            assert.isArray(ClipList.getList());
        });
    });
});