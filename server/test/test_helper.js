const assert = require('chai').assert;
const expect = require('chai').expect

const helper = require('../lib/helper');

describe('Helper functions', function() {
    describe('ensureArgument', function() {
        /*
            Supported legal arguments:
                String
                Number
                Boolean
                Array
                Object
            Supported illegal arguments:
                Undefined
         */
        it('should throw without an argument', function() {
            expect(function (){helper.ensureArgument()}).to.throw();
            expect(function (){helper.ensureArgument(undefined)}).to.throw();
        });
        it('should not throw if type is undefined', function() {
            expect(function (){helper.ensureArgument('string')}).to.not.throw();
            expect(function (){helper.ensureArgument(123)}).to.not.throw();
            expect(function (){helper.ensureArgument(false)}).to.not.throw();
            expect(function (){helper.ensureArgument({data:['hey']})}).to.not.throw();
            expect(function (){helper.ensureArgument([1,'string',true,{hey:'object'}])}).to.not.throw();
        });
        describe('String type', function() {
            it('should not throw if type is string and argument is a string', function() {
                expect(function (){helper.ensureArgument('string', 'string')}).to.not.throw();
                expect(function (){helper.ensureArgument('239', 'string')}).to.not.throw();
                expect(function (){helper.ensureArgument('mbv3q\nasd ', 'string')}).to.not.throw();
            });
            it('should not change the value of the argument', function() {
                let arg = 'string';
                const comp = arg;
                helper.ensureArgument(arg);
                expect(comp).to.equal(arg);
            });
            it('should throw if type is string and argument is not a string', function() {
                expect(function (){helper.ensureArgument(123, 'string')}).to.throw();
                expect(function (){helper.ensureArgument(false, 'string')}).to.throw();
                expect(function (){helper.ensureArgument(true, 'string')}).to.throw();
                expect(function (){helper.ensureArgument({}, 'string')}).to.throw();
                expect(function (){helper.ensureArgument([], 'string')}).to.throw();
            });
        });
        describe('Number type', function() {
            it('should not throw if type is number and argument is a number', function() {
                expect(function (){helper.ensureArgument(0, 'number')}).to.not.throw();
                expect(function (){helper.ensureArgument(-4094906161, 'number')}).to.not.throw();
                expect(function (){helper.ensureArgument(-0, 'number')}).to.not.throw();
                expect(function (){helper.ensureArgument(+0, 'number')}).to.not.throw();
                expect(function (){helper.ensureArgument(498409466555999, 'number')}).to.not.throw();
                expect(function (){helper.ensureArgument(1, 'number')}).to.not.throw();
                expect(function (){helper.ensureArgument(-1, 'number')}).to.not.throw();
            });
            it('should not change the value of the argument', function() {
                let arg = 123;
                const comp = arg;
                helper.ensureArgument(arg);
                expect(comp).to.equal(arg);
            });
            it('should throw if type is number and argument is not a number', function() {
                const unparsedError = "unparsed number";
                expect(function (){helper.ensureArgument('0', 'number')}).to.throw(unparsedError);
                expect(function (){helper.ensureArgument('-1', 'number')}).to.throw(unparsedError);
                expect(function (){helper.ensureArgument('12361', 'number')}).to.throw(unparsedError);

                expect(function (){helper.ensureArgument('string', 'number')}).to.throw();
                expect(function (){helper.ensureArgument(false, 'number')}).to.throw();
                expect(function (){helper.ensureArgument(true, 'number')}).to.throw();
                expect(function (){helper.ensureArgument({}, 'number')}).to.throw();
                expect(function (){helper.ensureArgument([], 'number')}).to.throw();
            });
        });
        describe('Boolean type', function() {
            it('should not throw if type is boolean and argument is a boolean', function() {
                expect(function (){helper.ensureArgument(true, 'boolean')}).to.not.throw();
                expect(function (){helper.ensureArgument(false, 'boolean')}).to.not.throw();
            });
            it('should not change the value of the argument', function() {
                let arg1 = false;
                const comp1 = arg1;
                helper.ensureArgument(arg1);
                expect(comp1).to.equal(arg1);
            });
            it('should throw if type is boolean and argument is not a boolean', function() {
                const booleanInString = "string including a boolean";
                expect(function (){helper.ensureArgument('true', 'boolean')}).to.throw(booleanInString);
                expect(function (){helper.ensureArgument('false', 'boolean')}).to.throw(booleanInString);

                expect(function (){helper.ensureArgument(123, 'boolean')}).to.throw();
                expect(function (){helper.ensureArgument('string', 'boolean')}).to.throw();
                expect(function (){helper.ensureArgument({}, 'boolean')}).to.throw();
                expect(function (){helper.ensureArgument([], 'boolean')}).to.throw();
            });
        });
        describe('Array type', function() {
            it('should not throw if type is array and argument is an array', function() {
                expect(function (){helper.ensureArgument([], 'array')}).to.not.throw();
                expect(function (){helper.ensureArgument([123,234,'string'], 'array')}).to.not.throw();
            });
            it('should not change the value of the argument', function() {
                let arg1 = [false, 123];
                const comp1 = arg1;
                helper.ensureArgument(arg1);
                expect(comp1).to.equal(arg1);
            });
            it('should throw if type is array and argument is not an array', function() {
                const arrayInString = "string including an array";
                expect(function (){helper.ensureArgument('[]', 'array')}).to.throw(arrayInString);
                expect(function (){helper.ensureArgument('[123,234,"string"]', 'array')}).to.throw(arrayInString);

                expect(function (){helper.ensureArgument(123, 'array')}).to.throw();
                expect(function (){helper.ensureArgument('string', 'array')}).to.throw();
                expect(function (){helper.ensureArgument({}, 'array')}).to.throw();
                expect(function (){helper.ensureArgument({"data": []}, 'array')}).to.throw();
                expect(function (){helper.ensureArgument({"data": [123]}, 'array')}).to.throw();
                expect(function (){helper.ensureArgument(false, 'array')}).to.throw();
                expect(function (){helper.ensureArgument(true, 'array')}).to.throw();
            });
        });
        describe('Object type', function() {
            it('should not throw if type is object and argument is an object', function() {
                expect(function (){helper.ensureArgument({}, 'object')}).to.not.throw();
                expect(function (){helper.ensureArgument({"data":[]}, 'object')}).to.not.throw();
            });
            it('should not change the value of the argument', function() {
                let arg1 = {"data":[]};
                const comp1 = arg1;
                helper.ensureArgument(arg1);
                expect(comp1).to.equal(arg1);
            });
            it('should throw if type is object and argument is not an object', function() {
                const objectInString = "string including an object";
                expect(function (){helper.ensureArgument('{}', 'object')}).to.throw(objectInString);
                expect(function (){helper.ensureArgument('{"data":{"test":[]}}', 'object')}).to.throw(objectInString);

                expect(function (){helper.ensureArgument(123, 'object')}).to.throw();
                expect(function (){helper.ensureArgument('string', 'object')}).to.throw();
                expect(function (){helper.ensureArgument([], 'object')}).to.throw();
                expect(function (){helper.ensureArgument([123,234,'string'], 'object')}).to.throw();
                expect(function (){helper.ensureArgument(false, 'object')}).to.throw();
                expect(function (){helper.ensureArgument(true, 'object')}).to.throw();
            });
        });
    });
});